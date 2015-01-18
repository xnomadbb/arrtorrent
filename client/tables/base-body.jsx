const React = require('react');

module.exports = React.createClass({
	displayName: 'BaseTableBody',

	renderCol: function(columnDescription) {
		return <col key={columnDescription.key} className={columnDescription.key} />;
	},

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
		let cols = this.props.columnDescriptions.map(this.renderCol);
		let rows = [];
		for (let key in this.props.rowData) {
			rows.push(this.renderRow(key, this.props.rowData[key]));
		}

		return (
			<table className="BaseTableBody">
				<tbody>
					{ rows }
				</tbody>
				<colgroup>
					{ cols }
				</colgroup>
			</table>
		)
	},
});
