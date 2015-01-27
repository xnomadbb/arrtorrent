const React = require('react/addons');
const _ = require('lodash');

let TableBodyCell = React.createClass({
	displayName: 'TableBodyCell',
	shouldComponentUpdate: function(nextProps) {
		return !('renderHash' in nextProps) || this.props.renderHash !== nextProps.renderHash;
	},
	render: function() {
		let contents = this.props.columnDescription.renderCellContents(this.props.rowData);

		let classes = {};
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

let TableBodyRow = React.createClass({
	displayName: 'TableBodyRow',
	shouldComponentUpdate: function(nextProps) {
		// columnDescriptions are constant
		return (
			JSON.stringify(this.props.columnOrder) !== JSON.stringify(nextProps.columnOrder) ||
			!('renderHash' in nextProps) ||
			this.props.renderHash !== nextProps.renderHash
		);
	},
	render: function() {
		let cells = this.props.columnOrder.map(columnKey => {
			return (
				<TableBodyCell key={columnKey} rowData={this.props.rowData} columnDescription={this.props.columnDescriptions[columnKey]} renderHash={this.props.renderHash} />
			);
		});

		return (
			<tr>
				{ cells }
			</tr>
		);
	},
});





module.exports = React.createClass({
	displayName: 'BaseTable',
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
		let sortData = [];
		let getSortKey = this.props.columnDescriptions[this.state.sortKey].getSortKey; // Gets the value to sort with

		// Insert new data
		for (let rowKey in this.props.rowData) {
			let rowData = this.props.rowData[rowKey];
			let sortKey = getSortKey(rowData);
			sortData.push({
				rowKey: rowKey,
				sortKey: sortKey,
			});
		}

		// Sort by sortKey
		let sortSign = (this.state.sortDirection === 'DESC') ? -1 : 1;
		sortData.sort(function(a, b) {
			let av = a.sortKey, bv = b.sortKey;
			return ((av > bv) - (av < bv)) * sortSign;
		});

		return sortData.map(x => { return x.rowKey; });
	},

	getRenderInfo: function() {
		// Ordered list of row keys for entire dataset
		let sortedKeys = this.getSortedKeys();
		// Highest number of rows to be rendered
		let maxLength = sortedKeys.length;
		// Index of the topmost rendered (visible) row
		let topRenderIndex = Math.floor(this.state.tableTopOffset / this.state.rowHeight);
		// Max number of rows the current table view can hold
		let maxRowsRenderCount = Math.ceil(this.state.tableHeight / this.state.rowHeight);
		// Number of rows remaining in the list or number the table will hold, whichever is lower
		let actualRowsRenderCount = Math.min(maxRowsRenderCount, maxLength - topRenderIndex);

		let topPadding = Math.min(this.state.tableTopOffset, this.state.rowHeight * (maxLength - maxRowsRenderCount));
		topPadding = Math.max(0, topPadding);
		let bottomPadding = (maxLength * this.state.rowHeight) - topPadding - (actualRowsRenderCount * this.state.rowHeight);
		bottomPadding = Math.max(0, bottomPadding);
		let rowKeys = sortedKeys.slice(topRenderIndex, topRenderIndex + actualRowsRenderCount);

		return ({
			topPadding: topPadding,
			bottomPadding: bottomPadding,
			rowKeys: rowKeys,
		});
	},

	//FIXME don't swap the column orders, move the FROM column before/after the TO column.
	//FIXME Preferably base before/after on whether drop is on left/right of the TO column.
	//FIXME display column separators on drag/hover.
	//FIXME display destination separator darker/thicker on drag/hover.

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
		e.dataTransfer.setData(JSON.stringify({
			'action': 'header_reorder',
			'table_key': this.props.tableKey,
			'column_key': columnKey,
		}), 'arr');
	},
	headerReorderHandleDragOver: function(columnKey, e) {
		let data = JSON.parse(e.dataTransfer.types[0]);
		if ( data.action !== 'header_reorder' // Wrong action
			|| data.table_key !== this.props.tableKey // Wrong table
			|| data.column_key === columnKey // Same column
			|| this.state.columnOrder.indexOf(data.column_key) === -1 // Invalid column
		) {
			console.debug('Rejected reorder event:', data); //XXX log
			return;
		}

		e.dataTransfer.effectAllowed = e.dataTransfer.dropEffect = 'move';
		e.preventDefault(); // Accept drop
	},
	headerReorderHandleDrop: function(toColumnKey, e) {
		// data already validated on dragover
		let data = JSON.parse(e.dataTransfer.types[0]);
		let fromColumnKey = data.column_key;
		console.log('reorder (from to)', fromColumnKey, toColumnKey); //XXX log

		// Swap columns
		let columnOrder = this.state.columnOrder.slice(); // New instance
		let fromIndex = columnOrder.indexOf(fromColumnKey);
		let toIndex   = columnOrder.indexOf(  toColumnKey);
		columnOrder[fromIndex] =   toColumnKey;
		columnOrder[  toIndex] = fromColumnKey;
		this.setState({columnOrder: columnOrder});

		e.preventDefault(); // Prevent browser from handling drop also
	},

	handleFlexResize: function() {
		this.updateScrollInfo();
	},
	updateScrollInfo: function() {
		let scrollContainer = this.refs.scrollContainer.getDOMNode();
		let firstRow = scrollContainer.querySelector('tr');
		if (firstRow) {
			this.setState({
				tableHeight: scrollContainer.getBoundingClientRect().height,
				tableTopOffset: scrollContainer.scrollTop,
				headerRowHeight: this.refs.tableHeader.getDOMNode().getBoundingClientRect().height,
				rowHeight: firstRow.getBoundingClientRect().height,
			});
		} else {
			this.setState({
				tableHeight: scrollContainer.getBoundingClientRect().height,
				tableTopOffset: scrollContainer.scrollTop,
				headerRowHeight: this.refs.tableHeader.getDOMNode().getBoundingClientRect().height,
			});
		}
	},
	resetScroll: function() {
		let scrollContainer = this.refs.scrollContainer;
		if (scrollContainer) {
			scrollContainer.getDOMNode().scrollTop = 0;
			this.setState({tableTopOffset: 0});
		}
	},

	componentWillMount: function() {
		this.updateSortOrder(this.props.initialSort[0], this.props.initialSort[1]);
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
		}
		this.updateScrollInfo();
	},


	renderHeaderCell: function(columnKey) {
		let columnDescription = this.props.columnDescriptions[columnKey];

		let classes = {};
		classes[columnKey] = true;
		classes['align_' + columnDescription.align] = true;
		if (this.state.sortKey === columnKey) {
			classes['sort_' + this.state.sortDirection] = true;
		}
		classes = React.addons.classSet(classes);

		return (
			<th key={columnKey} ref={'head_' + columnKey} className={classes} title={columnDescription.tooltip} draggable="true"
			onDragStart={this.headerReorderHandleDragStart.bind(this, columnKey)}
			onDragOver={this.headerReorderHandleDragOver.bind(this, columnKey)}
			onDrop={this.headerReorderHandleDrop.bind(this, columnKey)}
			onClick={this.updateSortOrder.bind(this, columnKey, 'toggle')} >
				{columnDescription.name}
			</th>
		);
	},
	render: function() {
		let headerCells = this.state.columnOrder.map(this.renderHeaderCell);
		let bodyRows = [];
		let renderInfo = this.getRenderInfo();
		let renderRowKeys = renderInfo.rowKeys;

		for (let i=0; i < renderRowKeys.length; i++) {
			let rowKey = renderRowKeys[i];
			let rowData = this.props.rowData[rowKey];
			bodyRows.push(<TableBodyRow key={rowKey} columnOrder={this.state.columnOrder} columnDescriptions={this.props.columnDescriptions} rowData={rowData} renderHash={rowData.renderHash} />);
		}

		return (
			<div className="BaseTable TorrentTable">
				<table ref="tableHeader" className="BaseTableHeader">
					<tbody>
						<tr>
							{ headerCells }
						</tr>
					</tbody>
				</table>
				<div ref="scrollContainer" className="BaseTableBodyContainer" onScroll={ _.throttle(this.updateScrollInfo, 16) }
				style={{height: 'calc(100% - '+ this.state.headerRowHeight +'px)'}} >
					<div ref="scrollPadTop" className="ScrollPadding" style={{height: renderInfo.topPadding}} />
					<table className="BaseTableBody">
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
