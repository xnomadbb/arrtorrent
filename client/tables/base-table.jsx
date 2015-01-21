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
