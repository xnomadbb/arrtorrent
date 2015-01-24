const React = require('react/addons');

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
			sortData: [],
		};
	},

	updateSorting: function(key, sortDirection, newProps) {
		// sortDirection isn't used in updating sortData, but it's still important
		// to save to the state for rendering.
		key = key || this.state.sortKey;
		sortDirection = sortDirection || this.state.sortDirection;
		let sortData = this.state.sortData; // Mutating in-place

		if (key === this.state.sortKey && !newProps) {
			// Flip direction if needed
			let newDirection = this.state.sortDirection;
			if (newDirection === 'ASC' && sortDirection !== 'ASC') {
				newDirection = 'DESC';
			} else if (newDirection === 'DESC' && sortDirection !== 'DESC') {
				newDirection = 'ASC';
			}

			this.setState({
				sortKey: key,
				sortDirection: newDirection,
				sortData: sortData,
			});
			return;
		}

		if (sortDirection === 'toggle') {
			sortDirection = 'ASC'; // Changing sorted key, ignore toggle request and init to ASC
		}

		// Remove everything, grab new keys and sort from scratch
		while (sortData.length > 0) sortData.pop(); // Empty and preserve the array

		// Insert new data
		let useProps = newProps || this.props; // componentWillReceiveProps makes this horribly clumsy
		let getSortKey = useProps.columnDescriptions[key].getSortKey; // Gets the value to sort with
		for (let rowKey in useProps.rowData) {
			let rowData = useProps.rowData[rowKey];
			let sortKey = getSortKey(rowData);
			sortData.push({
				rowKey: rowKey,
				sortKey: sortKey,
				renderHash: rowData.renderHash,
			});
		}

		// Sort by sortKey
		sortData.sort(function(a, b) {
			let av = a.sortKey, bv = b.sortKey;
			return ((av > bv) - (av < bv));
		});

		// Make sure a render is eventually triggered
		this.setState({
			sortKey: key,
			sortDirection: sortDirection,
			sortData: sortData,
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


	componentWillMount: function() {
		window.updateSorting = this.updateSorting; //XXX
		this.updateSorting(this.props.initialSort[0], this.props.initialSort[1], this.props);
	},
	componentWillReceiveProps: function(nextProps) {
		this.updateSorting(undefined, undefined, nextProps);
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
			onClick={this.updateSorting.bind(this, columnKey, 'toggle', false)} >
				{columnDescription.name}
			</th>
		);
	},

	render: function() {
		let headerCells = this.state.columnOrder.map(this.renderHeaderCell);
		let bodyRows = [];

		if (this.state.sortDirection === 'DESC') {
			for (let i=this.state.sortData.length; i--;) {
				let rowKey = this.state.sortData[i].rowKey;
				let rowData = this.props.rowData[rowKey];
				bodyRows.push(<TableBodyRow key={rowKey} columnOrder={this.state.columnOrder} columnDescriptions={this.props.columnDescriptions} rowData={rowData} renderHash={rowData.renderHash} />);
			}
		} else {
			for (let i=0; i < this.state.sortData.length; i++) {
				let rowKey = this.state.sortData[i].rowKey;
				let rowData = this.props.rowData[rowKey];
				bodyRows.push(<TableBodyRow key={rowKey} columnOrder={this.state.columnOrder} columnDescriptions={this.props.columnDescriptions} rowData={rowData} renderHash={rowData.renderHash} />);
			}
		}

		return (
			<div className="BaseTable TorrentTable">
				<table className="BaseTableHeader">
					<tbody>
						<tr>
							{ headerCells }
						</tr>
					</tbody>
				</table>
				<div className="BaseTableBodyContainer">
					<table className="BaseTableBody">
						<tbody>
							{ bodyRows }
						</tbody>
					</table>
				</div>
			</div>
		);
	},
});
