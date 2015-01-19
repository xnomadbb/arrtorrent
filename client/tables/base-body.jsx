const React = require('react');

module.exports = React.createClass({
	displayName: 'BaseTableBody',

	renderCell: function(columnDescription, rowData) {
		let contents = columnDescription.renderCellContents(rowData);
		return (
			<td key={columnDescription.key} className={columnDescription.key}>
				{ contents }
			</td>
		);
	},

	renderRow: function(rowKey, rowData) {
		let cells = this.props.columnDescriptions.map(columnDescription => {
			return this.renderCell(columnDescription, rowData);
		});
		return (
			<tr key={rowKey}>
				{ cells }
			</tr>
		);
	},

	render: function() {
		let rows = [];
		for (let key in this.props.rowData) {
			rows.push(this.renderRow(key, this.props.rowData[key]));
		}

		return (
			<table className="BaseTableBody">
				<tbody>
					{ rows }
				</tbody>
			</table>
		)
	},
});
