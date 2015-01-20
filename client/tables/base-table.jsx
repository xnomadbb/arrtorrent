const React = require('react');

module.exports = React.createClass({
	displayName: 'BaseTable',

	renderHeaderCell: function(columnDescription) {
		return (
			<th key={columnDescription.key} className={columnDescription.key} title={columnDescription.tooltip}>{columnDescription.name}</th>
		);
	},
	renderBodyRow: function(rowKey, rowData) {
		let cells = this.props.columnDescriptions.map(columnDescription => {
			return this.renderBodyCell(columnDescription, rowData);
		});
		return (
			<tr key={rowKey}>
				{ cells }
			</tr>
		);
	},
	renderBodyCell: function(columnDescription, rowData) {
		let contents = columnDescription.renderCellContents(rowData);
		return (
			<td key={columnDescription.key} className={columnDescription.key}>
				{ contents }
			</td>
		);
	},

	render: function() {
		let headerCells = this.props.columnDescriptions.map(this.renderHeaderCell);
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
