var React = require('react');
var ViewStore = require('../stores/view');
var TorrentColumns = require('./torrent-columns');
var BaseTable = require('./base-table');

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
		var rowData = ViewStore.viewContents[this.props.activeView];
		return (
			<BaseTable ref="flexResizerNotifyProxy" tableKey="torrent" className="TorrentTable"
			columnDescriptions={TorrentColumns.columns} initialColumnOrder={TorrentColumns.initialOrder}
			initialSort={['name', 'ASC']} rowData={rowData} />
		);
	},
});
