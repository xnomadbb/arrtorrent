const React = require('react');
const ViewStore = require('../stores/view');
const TorrentColumns = require('./torrent-columns');
const BaseTable = require('./base-table');

module.exports = React.createClass({
	displayName: 'TorrentTable',
	componentWillMount: function() {
		ViewStore.on('change', this.viewDidChange);
	},
	componentWillUnmount: function() {
		ViewStore.removeListener('change', this.viewDidChange);
	},
	viewDidChange: function() {
		this.forceUpdate();
	},
	render: function() {
		let rowData = ViewStore.viewContents[this.props.activeView];
		return <BaseTable tableKey="torrent" columnDescriptions={TorrentColumns.columns} initialColumnOrder={TorrentColumns.initialOrder} rowData={rowData} />;
	},
});
