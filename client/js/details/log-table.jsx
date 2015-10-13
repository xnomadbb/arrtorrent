var React = require('react');
var BaseTable = require('../components/base-table');
var LogStore = require('../stores/log');
var LogColumns = require('./log-table-columns');


var LogTable = React.createClass({
	getInitialState: function() {
		return {
			'levelFilter': LogStore.levels.user_info,
			'rowData': {},
		};
	},

	componentWillMount: function() {
		LogStore.on('change', this.logsDidChange);
		LogStore.on('empty', this.logsDidEmpty);
		this.logsDidEmpty();
	},
	componentWillUnmount: function() {
		LogStore.removeListener('change', this.logsDidChange);
		LogStore.removeListener('empty', this.logsDidEmpty);
	},

	logsDidChange: function(logEvent) {
		// Logs are considered immutable once written, so we can get away with appending.
		if (logEvent.levelNumber >= this.state.levelFilter) {
			var rowData = this.state.rowData;
			rowData[logEvent.id] = logEvent;
			this.setState({rowData: rowData});
		}
	},
	logsDidEmpty: function() {
		this.rebuildRowData(this.state.levelFilter);
	},

	rebuildRowData: function(levelFilter) {
		var rowData = {};
		for (var id in LogStore.events) {
			var logEvent = LogStore.events[id];
			if (logEvent.levelNumber >= levelFilter) {
				rowData[logEvent.id] = logEvent;
			}
		}
		this.setState({rowData: rowData, levelFilter: levelFilter});
	},

	handleEmptyCommand: function() {
		LogStore.empty();
	},
	handleFilterSelect: function(event) {
		this.rebuildRowData(event.target.value);
	},

	renderFilterSelector: function() {
		var filterOptions = [];
		for (var levelName in LogStore.levels) {
			var levelNumber = LogStore.levels[levelName];
			filterOptions.push(
				<option key={levelNumber} value={levelNumber}>{ levelName }</option>
			);
		}

		return (
			<span>
				<label className="LogFilterLabel" htmlFor="LogFilterSelector">Minimum log level: </label>
				<select ref="LogFilterSelector" id="LogFilterSelector" value={this.state.levelFilter} onChange={this.handleFilterSelect}>
					{ filterOptions }
				</select>
			</span>
		);
	},

	render: function() {
		var filterSelector = this.renderFilterSelector();
		return (
			<div className="BaseTableContainer LogTableContainer">
				<div className="BaseTableBefore">
					<button onClick={this.handleEmptyCommand}>Clear</button>
					{ filterSelector }
				</div>
				<BaseTable tableKey="log" className="LogTable"
				columnDescriptions={LogColumns.columns} initialColumnOrder={LogColumns.initialOrder}
				initialSort={['timestamp', 'DESC']} rowData={this.state.rowData} />
			</div>
		);
	},
});

module.exports = LogTable;
