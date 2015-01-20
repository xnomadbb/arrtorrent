const React = require('react');

module.exports = React.createClass({
	displayName: 'BaseTable',
	getInitialState: function() {
		return {
			columnOrder: this.props.initialColumnOrder.slice(),
		};
	},


	// Non-Firefox browsers can't get at the data on dragover.
	// For any complicated checking this is a huge pain in the ass.
	// We abuse the type string to sneak some data around.
	// Putting anything sensitive in this string is a terrible idea,
	// we're actively circumventing a security measure because the
	// DnD spec is awful. (Firefox enforces same-origin policy on
	// the data during this event, which is a much saner idea.)
	headerReorderHandleDragStart: function(columnKey, e) {
		e.dataTransfer.setData('arr/table/header/reorder/' + this.props.tableKey + '/' + columnKey, 'arr');
	},
	headerReorderHandleDragOver: function(columnKey, e) {
		let data = e.dataTransfer.types[0].split('/');
		if ( data.length !== 6
			|| data[0] !== 'arr'
			|| data[1] !== 'table'
			|| data[2] !== 'header'
			|| data[3] !== 'reorder'
			|| data[4] !== this.props.tableKey // Wrong table
			|| data[5] === columnKey // Same column
			|| this.state.columnOrder.indexOf(data[5]) === -1 // Invalid column
		) {
			console.debug('Rejected reorder event:', data); //XXX log
			return;
		}

		e.dataTransfer.effectAllowed = e.dataTransfer.dropEffect = 'move';
		e.preventDefault(); // Accept drop
	},
	headerReorderHandleDrop: function(toColumnKey, e) {
		// data already validated on dragover
		let data = e.dataTransfer.types[0].split('/');
		let fromColumnKey = data[5];
		console.log('reorder (from to)', fromColumnKey, toColumnKey); //XXX log

		// Swap columns
		let columnOrder = this.state.columnOrder;
		let fromIndex = columnOrder.indexOf(fromColumnKey);
		let toIndex   = columnOrder.indexOf(  toColumnKey);
		columnOrder[fromIndex] =   toColumnKey;
		columnOrder[  toIndex] = fromColumnKey;
		this.setState({columnOrder: columnOrder});

		e.preventDefault(); // Prevent browser from handling drop also
	},


	renderHeaderCell: function(columnKey) {
		let columnDescription = this.props.columnDescriptions[columnKey];
		return (
			<th key={columnKey} ref={'head_' + columnKey} className={columnKey} title={columnDescription.tooltip} draggable="true"
			onDragStart={this.headerReorderHandleDragStart.bind(this, columnKey)}
			onDragOver={this.headerReorderHandleDragOver.bind(this, columnKey)}
			onDrop={this.headerReorderHandleDrop.bind(this, columnKey)} >
				{columnDescription.name}
			</th>
		);
	},

	renderBodyRow: function(rowKey, rowData) {
		let cells = this.state.columnOrder.map(columnKey => {
			return this.renderBodyCell(columnKey, rowData);
		});

		return (
			<tr key={rowKey}>
				{ cells }
			</tr>
		);
	},

	renderBodyCell: function(columnKey, rowData) {
		let columnDescription = this.props.columnDescriptions[columnKey];
		let contents = columnDescription.renderCellContents(rowData);
		return (
			<td key={columnDescription.key} className={columnDescription.key}>
				{ contents }
			</td>
		);
	},

	render: function() {
		let headerCells = this.state.columnOrder.map(this.renderHeaderCell);
		let bodyRows = [];
		for (let key in this.props.rowData) {
			bodyRows.push(this.renderBodyRow(key, this.props.rowData[key]));
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
