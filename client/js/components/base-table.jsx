var React = require('react/addons');
var _ = require('lodash');
var log = require('../stores/log').module('BaseTable');
var ContextMenuMixin = require('../mixins/context-menu');
var Event = require('../event');

var TableBodyCell = React.createClass({
	shouldComponentUpdate: function(nextProps) {
		return !('renderHash' in nextProps) || this.props.renderHash !== nextProps.renderHash;
	},
	render: function() {
		var contents = this.props.columnDescription.renderCellContents(this.props.rowData);

		var classes = {};
		classes['align_' + this.props.columnDescription.align] = true;
		classes[this.props.columnDescription.key] = true;
		classes = React.addons.classSet(classes);

		return (
			<td key={this.props.columnDescription.key} className={classes}>
				{ contents }
			</td>
		);
	},
});

var TableBodyRow = React.createClass({
	mixins: [ContextMenuMixin],
	shouldComponentUpdate: function(nextProps) {
		// columnDescriptions are constant
		return (
			JSON.stringify(this.props.columnOrder) !== JSON.stringify(nextProps.columnOrder) ||
			!('renderHash' in nextProps) ||
			this.props.renderHash !== nextProps.renderHash ||
			this.props.selected !== nextProps.selected ||
			this.props.focused !== nextProps.focused
		);
	},
	render: function() {
		var cells = [];
		var columnOrder = this.props.columnOrder;
		var columnDescriptions = this.props.columnDescriptions;
		for (var i=0; i < columnOrder.length; i++) {
			cells.push(
				<TableBodyCell key={columnOrder[i]} rowData={this.props.rowData}
				columnDescription={columnDescriptions[columnOrder[i]]} renderHash={this.props.renderHash} />
			);
		}

		var classes = React.addons.classSet({
			focused: this.props.focused,
			selected: this.props.selected,
		});

		return (
			<tr className={classes} onClick={this.props.onClick}>
				{ cells }
			</tr>
		);
	},
});





var BaseTable = React.createClass({
	getInitialState: function() {
		return {
			columnOrder: this.props.initialColumnOrder.slice(),
			// Sort initialized in componentWillMount
			sortKey: null,
			sortDirection: 'ASC',
			// Scrolling data
			rowHeight: 16, // pixel height of one row, this is just an initial approximation, better low than high so we render enough rows
			headerRowHeight: 16, // pixel height of table header, this is just an initial approximation
			tableHeight: 50, // pixel height of table viewport, this is just an initial approximation
			tableTopOffset: 0, // pixel height we've scrolled down
			// Row selection/focus data
			focusedRow: null,
			selectedRows: [],
		};
	},

	updateSortOrder: function(key, sortDirection) {
		key = key || this.state.sortKey;
		sortDirection = sortDirection || this.state.sortDirection;
		if (sortDirection === 'toggle') {
			if (key === this.state.sortKey) {
				sortDirection = (this.state.sortDirection === 'ASC') ? 'DESC' : 'ASC';
			} else {
				sortDirection = 'ASC';
			}
		}

		if (key !== this.state.sortKey || sortDirection !== this.state.sortDirection) {
			this.resetScroll();
			this.setState({
				sortKey: key,
				sortDirection: sortDirection,
			});
		}
	},
	getSortedKeys: function() {
		var sortData = [];
		var getSortKey = this.props.columnDescriptions[this.state.sortKey].getSortKey; // Gets the value to sort with

		// Insert new data
		for (var rowKey in this.props.rowData) {
			var rowData = this.props.rowData[rowKey];
			var sortKey = getSortKey(rowData);
			sortData.push({
				rowKey: rowKey,
				sortKey: sortKey,
			});
		}

		// Sort by sortKey
		var sortSign = (this.state.sortDirection === 'DESC') ? -1 : 1;
		sortData.sort(function(a, b) {
			// In case sortKeys are equal, rowKeys provide a stable sort.
			// Compare by sortKey:    -2, 0, +2
			// Then adjust by rowKey: -1, 0, +1
			var as = a.sortKey, bs = b.sortKey;
			var ar = a.rowKey,  br = b.rowKey;
			return sortSign * (
				((as > bs) - (as < bs)) * 2 +
				((ar > br) - (ar < br))
			);
		});

		return sortData.map(function(x) { return x.rowKey; });
	},

	getRenderInfo: function() {
		// Ordered list of row keys for entire dataset
		var sortedKeys = this.getSortedKeys();
		// Highest number of rows to be rendered
		var maxLength = sortedKeys.length;
		// Index of the topmost rendered (visible) row
		var topRenderIndex = Math.floor(this.state.tableTopOffset / this.state.rowHeight);
		// Max number of rows the current table view can hold
		var maxRowsRenderCount = Math.ceil(this.state.tableHeight / this.state.rowHeight);
		// Number of rows remaining in the list or number the table will hold, whichever is lower
		var actualRowsRenderCount = Math.min(maxRowsRenderCount, maxLength - topRenderIndex);

		var topPadding = Math.min(this.state.tableTopOffset, this.state.rowHeight * (maxLength - maxRowsRenderCount));
		topPadding = Math.max(0, topPadding);
		var bottomPadding = (maxLength * this.state.rowHeight) - topPadding - (actualRowsRenderCount * this.state.rowHeight);
		bottomPadding = Math.max(0, bottomPadding);
		var rowKeys = sortedKeys.slice(topRenderIndex, topRenderIndex + actualRowsRenderCount);

		return ({
			topPadding: topPadding,
			bottomPadding: bottomPadding,
			rowKeys: rowKeys,
		});
	},

	//FIXME reorder: Don't swap the column orders, move the FROM column before/after the TO column.
	//FIXME reorder: Preferably base before/after on whether drop is on left/right of the TO column.
	//FIXME reorder: Display destination separator darker/thicker during reorder.

	// Non-Firefox browsers can't get at the data on dragover.
	// For any complicated checking this is a huge pain in the ass.
	// We abuse the type string to sneak some data around.
	// Putting anything sensitive in this string is a terrible idea,
	// we're actively circumventing a security measure because the
	// DnD spec is awful. (Firefox enforces same-origin policy on
	// the data during this event, which is a much saner idea.)
	// We can sneak JSON-encoded text through here, but beware that it
	// gets converted to lowercase in the process.
	headerReorderHandleDragStart: function(columnKey, e) {
		log.debug('ColumnReorderDragStart', 'Began column reorder', columnKey);
		e.dataTransfer.setData(JSON.stringify({
			'action': 'header_reorder',
			'table_key': this.props.tableKey,
			'column_key': columnKey,
		}), 'arr');
	},
	headerResizeHandleDragStart: function(columnKey, e) {
		log.debug('ColumnResizeDragStart', 'Began column resize', columnKey);
		var initial_width = Math.ceil(e.target.parentNode.getBoundingClientRect().width);
		var initial_x = e.clientX;
		var stripe_offset = this.refs.tableRoot.getDOMNode().scrollLeft - this.refs.tableRoot.getDOMNode().getBoundingClientRect().left;
		this.refs.columnResizeStripe.getDOMNode().style.left = e.clientX + stripe_offset + 'px';
		e.dataTransfer.setData(JSON.stringify({
			'action': 'header_resize',
			'table_key': this.props.tableKey,
			'column_key': columnKey,
			'initial_width': initial_width,
			'initial_x': initial_x,
			'stripe_offset': stripe_offset,
		}), 'arr');
		e.stopPropagation(); // header_reorder will also process otherwise
	},
	headerHandleDragOver: function(columnKey, e) {
		var data = e.dataTransfer.types[0];
		if (data.indexOf('{') !== 0) {
			log.debug('RejectColumnDragOver', 'Rejected non-JSON event', data);
			return;
		}
		data = JSON.parse(data);

		if (data.action === 'header_reorder') {
			if (data.table_key !== this.props.tableKey // Wrong table
				|| data.column_key === columnKey // Same column
				|| this.state.columnOrder.indexOf(data.column_key) === -1 // Invalid column
			) {
				log.debug('RejectColumnDragOver', 'Rejected invalid reorder event', data);
				return;
			}
			// Handle reorder update



		} else if (data.action === 'header_resize') {
			if (data.table_key !== this.props.tableKey // Wrong table
				|| this.state.columnOrder.indexOf(data.column_key) === -1 // Invalid column
			) {
				log.debug('RejectColumnDragOver', 'Rejected invalid resize event', data);
				return;
			}
			// Handle resize update
			this.refs.columnResizeStripe.getDOMNode().style.left = e.clientX + data.stripe_offset + 'px';

		} else {
				log.debug('RejectColumnDragOver', 'Rejected invalid event', data);
				return;
		}

		e.dataTransfer.effectAllowed = e.dataTransfer.dropEffect = 'move';
		e.preventDefault(); // Accept drop
	},
	headerHandleDrop: function(toColumnKey, e) {
		// data already validated on dragover
		var data = JSON.parse(e.dataTransfer.types[0]);
		var fromColumnKey = data.column_key;

		if (data.action === 'header_reorder') {
			log.debug('AcceptColumnDrop', 'Column reorder from', fromColumnKey, 'to', toColumnKey);

			// Swap columns
			var columnOrder = this.state.columnOrder.slice(); // New instance
			var fromIndex = columnOrder.indexOf(fromColumnKey);
			var toIndex   = columnOrder.indexOf(  toColumnKey);
			columnOrder[fromIndex] =   toColumnKey;
			columnOrder[  toIndex] = fromColumnKey;
			this.setState({columnOrder: columnOrder});
		} else if (data.action === 'header_resize') {
			// Resize columns
			this.refs.columnResizeStripe.getDOMNode().style.left = -1 + 'px';
			var newWidth = (data.initial_width + e.clientX - data.initial_x) + 'px';
			this.refs.tableHeader.getDOMNode().querySelector('col.' + data.column_key).style.width = newWidth;
			this.refs.tableBody.getDOMNode().querySelector(  'col.' + data.column_key).style.width = newWidth;
			log.debug('AcceptColumnResize', 'Column resize', data.column_key, data.initial_width, newWidth);
		}

		e.preventDefault(); // Prevent browser from handling drop also
	},

	handleRowClick: function(targetKey, e) {
		if (e.ctrlKey) {
			// Invert targeted row, set focus to targeted row
			var selectedRows = _.xor(this.state.selectedRows, [targetKey]);
			this.setState({focusedRow: targetKey, selectedRows: selectedRows});
		} else if (e.shiftKey && this.state.focusedRow !== null) {
			// Select from focused row to targeted row, leave focus as-is
			var sortedKeys = this.getSortedKeys();
			var fromIndex = sortedKeys.indexOf(this.state.focusedRow);
			var   toIndex = sortedKeys.indexOf(targetKey);
			var min = Math.min(fromIndex, toIndex);
			var max = Math.max(fromIndex, toIndex);
			if (min === -1) {
				// Either focus or target no longer exists, just select/focus the target
				this.setState({focusedRow: targetKey, selectedRows: [targetKey]});
			} else {
				this.setState({selectedRows: sortedKeys.splice(min, max-min+1)});
			}
		} else {
			// Normal click or shift-click with no "from" (focused) row set,
			// select only targeted row and set focus to targeted row
			this.setState({focusedRow: targetKey, selectedRows: [targetKey]});
		}
	},

	getContextMenuOptions: function(rowKey) {
		var isSelected = this.state.selectedRows.indexOf(rowKey) !== -1;
		if (isSelected) {
			var allRowData = this.props.rowData;
			var selectedData = this.state.selectedRows.map(function(key) {
				return allRowData[key];
			});
			return this.props.getContextMenuOptions(selectedData);
		} else {
			this.setState({focusedRow: rowKey, selectedRows: [rowKey]});
			return this.props.getContextMenuOptions([this.props.rowData[rowKey]]);
		}
	},

	handlePaneResize: function() {
		this.updateScrollInfo();
	},
	updateScrollInfo: function() {
		var scrollContainer = this.refs.scrollContainer.getDOMNode();

		this.setState({
			tableHeight: scrollContainer.getBoundingClientRect().height,
			tableTopOffset: scrollContainer.scrollTop,
			headerRowHeight: this.refs.tableHeader.getDOMNode().getBoundingClientRect().height,
		});

		// Only update the row height if there's something there with non-zero height (it's 0 during display:none)
		// We need to be cautious here because if this is set to 0 no rows will render and so it will never become non-zero.
		var firstRow = scrollContainer.querySelector('tr');
		if (firstRow) {
			var rowHeight = firstRow.getBoundingClientRect().height;
			if (rowHeight) {
				this.setState({
					rowHeight: firstRow.getBoundingClientRect().height,
				});
			}
		}
	},
	resetScroll: function() {
		var scrollContainer = this.refs.scrollContainer;
		if (scrollContainer) {
			scrollContainer.getDOMNode().scrollTop = 0;
			this.setState({tableTopOffset: 0});
		}
	},

	componentWillMount: function() {
		this.updateSortOrder(this.props.initialSort[0], this.props.initialSort[1]);
		Event.on('PaneResize', this.handlePaneResize);
	},
	componentWillUnmount: function() {
		Event.removeListener('PaneResize', this.handlePaneResize);
	},
	componentDidMount: function() {
		// We need an extra render cycle to gather heights/etc that are done on-the-fly
		this.updateScrollInfo();
		this.forceUpdate();
	},
	componentWillReceiveProps: function(nextProps) {
		if (this.props.rowData !== nextProps.rowData) {
			// Nothing ever truly changes except rowData when the view changes.
			// When contents are mutated rowData is changed in-place and forceUpdate
			// is called, so rowData is the same object. So we only reset scrolling
			// when we're viewing a different object, not when it merely mutates.
			this.resetScroll();
			this.setState({focusedRow: null, selectedRows: []});
		}
		this.updateScrollInfo();
	},
	componentWillUpdate: function(nextProps, nextState) {
		if (this.state.focusedRow !== nextState.focusedRow) {
			Event.emit('BaseTable.FocusChange', this.props.tableKey, nextState.focusedRow);
		}
	},


	renderHeaderCell: function(columnKey) {
		var columnDescription = this.props.columnDescriptions[columnKey];

		var classes = {};
		classes[columnKey] = true;
		classes['align_' + columnDescription.align] = true;
		if (this.state.sortKey === columnKey) {
			classes['sort_' + this.state.sortDirection] = true;
		}
		classes = React.addons.classSet(classes);

		return (
			<th key={columnKey} ref={'head_' + columnKey} className={classes} title={columnDescription.tooltip} draggable="true"
			onDragStart={    this.headerReorderHandleDragStart.bind(this, columnKey)}
			onDragOver={     this.headerHandleDragOver.bind(        this, columnKey)}
			onDrop={         this.headerHandleDrop.bind(            this, columnKey)}
			onClick={        this.updateSortOrder.bind(             this, columnKey, 'toggle')} >
				{columnDescription.name}
				<span className="resizeHandle" draggable="true"
				onDragStart={this.headerResizeHandleDragStart.bind( this, columnKey)}
				onDragOver={ this.headerHandleDragOver.bind(        this, columnKey)}
				onDrop={     this.headerHandleDrop.bind(            this, columnKey)} />
			</th>
		);
	},
	renderColgroup: function(columnOrder) {
		var cols = columnOrder.map(function(columnKey) {
			return <col key={columnKey} className={columnKey} />;
		});
		return <colgroup>{cols}</colgroup>;
	},
	render: function() {
		var headerCells = this.state.columnOrder.map(this.renderHeaderCell);
		var bodyRows = [];
		var renderInfo = this.getRenderInfo();
		var renderRowKeys = renderInfo.rowKeys;

		if (this.props.updateVisibleRowKeys) {
			//XXX Hacky way to keep track of currently visible contents so we know what/when to poll
			this.props.updateVisibleRowKeys(renderRowKeys);
		}

		for (var i=0; i < renderRowKeys.length; i++) {
			var rowKey = renderRowKeys[i];
			var rowData = this.props.rowData[rowKey];
			var isSelected = this.state.selectedRows.indexOf(rowKey) !== -1;

			// Pass just the targeted row if it's not in the selection,
			// or the selection if it's part of it.
			var getContextMenuOptions = this.props.getContextMenuOptions;
			if (getContextMenuOptions) {
				getContextMenuOptions = this.getContextMenuOptions.bind(this, rowKey);
			}

			bodyRows.push(
				<TableBodyRow key={rowKey} rowData={rowData} renderHash={rowData.renderHash}
				columnOrder={this.state.columnOrder} columnDescriptions={this.props.columnDescriptions}
				focused={this.state.focusedRow === rowKey} selected={isSelected}
				onClick={this.handleRowClick.bind(this, rowKey)} getContextMenuOptions={getContextMenuOptions} />
			);
		}

		return (
			<div ref="tableRoot" className={"BaseTable " + this.props.className}>
				<table ref="tableHeader" className="BaseTableHeader">
					{ this.renderColgroup(this.state.columnOrder) }
					<tbody>
						<tr>
							{ headerCells }
						</tr>
					</tbody>
				</table>
				<div ref="columnResizeStripe" className="ColumnResizeStripe" />
				<div ref="scrollContainer" className="BaseTableBodyContainer" onScroll={ _.throttle(this.updateScrollInfo, 16) }
				style={{height: 'calc(100% - '+ this.state.headerRowHeight +'px)'}} >
					<div ref="scrollPadTop" className="ScrollPadding" style={{height: renderInfo.topPadding}} />
					<table ref="tableBody" className="BaseTableBody">
						{ this.renderColgroup(this.state.columnOrder) }
						<tbody>
							{ bodyRows }
						</tbody>
					</table>
					<div ref="scrollPadBottom" className="ScrollPadding" style={{height: renderInfo.bottomPadding}} />
				</div>
			</div>
		);
	},
});

module.exports = BaseTable;
