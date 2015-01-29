var React = require('react');
var BaseTable = require('./base-table');

var columns = {
	'datetime': {
		key: 'datetime',
		name: 'Time',
		tooltip: 'Date and time of log event',
		getSortKey: function(row) { return row.datetime; },
		renderCellContents: function(row) { return row.datetime; },
		align: 'left',
	},
	'message': {
		key: 'message',
		name: 'Message',
		tooltip: 'Content of log event',
		getSortKey: function(row) { return row.message; },
		renderCellContents: function(row) { return row.message; },
		align: 'left',
	},
};
var initialOrder = ['datetime', 'message'];

module.exports = React.createClass({
	displayName: 'LogTable',
	getInitialState: function() {
		return {
			logEntries: {
				'blah': {
					'datetime': 'blah blah blah',
					'message': 'herp herp derp',
				}
			},
		};
	},
	/*
	componentWillMount: function() {
		ViewStore.on('change', this.viewDidChange);
	},
	componentWillUnmount: function() {
		ViewStore.removeListener('change', this.viewDidChange);
	},
	viewDidChange: function() {
		this.forceUpdate();
	},
	*/
	render: function() {
		return (
			<BaseTable ref="flexResizerNotifyProxy" tableKey="log" className="LogTable"
			columnDescriptions={columns} initialColumnOrder={initialOrder}
			initialSort={['datetime', 'DESC']} rowData={this.state.logEntries} />
		);
	},
});
