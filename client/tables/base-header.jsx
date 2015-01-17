const React = require('react');

module.exports = React.createClass({
	displayName: 'BaseTableHeader',

	renderCell: function(columnDescription) {
		return (
			<th key={columnDescription.key}>{columnDescription.name}</th>
		);
	},

	render: function() {
		let headerCells = this.props.columnDescriptions.map(this.renderCell);
		return (
			<table className="BaseTableHeader">
				<tr>
					{ headerCells }
				</tr>
			</table>
		);
	},
});
