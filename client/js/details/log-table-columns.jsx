var React = require('react');
var util = require('../util');

var columns = {
	'level': {
		key: 'level',
		name: 'Level',
		tooltip: 'Severity level of log event',
		getSortKey: function(row) { return row.levelNumber; },
		renderCellContents: function(row) { return row.level; },
		align: 'left',
	},
	'timestamp': {
		key: 'timestamp',
		name: 'Time',
		tooltip: 'Date and time of log event',
		getSortKey: function(row) { return row.timestamp; },
		renderCellContents: function(row) { return util.format.unixTimeToHtmlDatetime(row.timestamp, true); },
		align: 'right',
	},
	'module': {
		key: 'module',
		name: 'Module',
		tooltip: 'Code module which generated log event',
		getSortKey: function(row) { return row.module; },
		renderCellContents: function(row) { return row.module; },
		align: 'left',
	},
	'event': {
		key: 'event',
		name: 'Event',
		tooltip: 'Abbreviated event code',
		getSortKey: function(row) { return row.eventCode; },
		renderCellContents: function(row) { return row.eventCode; },
		align: 'left',
	},
	'message': {
		key: 'message',
		name: 'Message',
		tooltip: 'Human-readable content of log event with full information',
		getSortKey: function(row) { return row.message.join(' '); },
		renderCellContents: function(row) {
			var fragments = [];
			for (var i=0; i < row.message.length; i++) {
				fragments.push(
					(['string', 'number'].indexOf(typeof row.message[i]) === -1) ?
					(<span key={i} className="logMessageFragment">{ JSON.stringify(row.message[i]) }</span>) :
					(<span key={i} className="logMessageFragment">{ row.message[i] }</span>)
				);
			}
			return (<span>{ fragments }</span>);
		},
		align: 'left',
	},
};

var initialOrder = [
	'level',
	'timestamp',
	'module',
	'event',
	'message'
];

module.exports = {columns: columns, initialOrder: initialOrder};
