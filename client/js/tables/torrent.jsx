var React = require('react/addons');
var ViewStore = require('../stores/view');
var TorrentStore = require('../stores/torrent');
var TorrentColumns = require('./torrent-columns');
var BaseTable = require('./base-table');

var TorrentTable = React.createClass({
	componentWillMount: function() {
		ViewStore.on('change', this.viewDidChange);
	},
	componentWillUnmount: function() {
		ViewStore.removeListener('change', this.viewDidChange);
	},
	viewDidChange: function() {
		this.forceUpdate();
	},

	handleRowVisibiliyChange: function(visibleRowKeys) {
		// lastRowsVisible isn't in state because it's not "state" in the sense that
		// it directly affects rendering. It would make more sense for this component
		// to own the visible row keys and pass them to the table, but then all of the
		// sorting/viewport/etc logic would need to be here. This is just used to figure
		// out when to poll rtorrent for changes to the currently visible torrents.
		if (!this.lastRowsVisible) { this.lastRowsVisible = []; }

		// No change
		if (JSON.stringify(visibleRowKeys) === JSON.stringify(this.lastRowsVisible)) { return; }

		// Queue an update as long as the viewport doesn't change any further.
		this.lastRowsVisible = visibleRowKeys;
		clearTimeout(this.rowVisibilityChangeTimer);
		this.rowVisibilityChangeTimer = setTimeout(this.updateVisibleRows, 3000);
	},
	updateVisibleRows: function() {
		// Request new data from rtorrent
		TorrentStore.queryHashListInfo(this.lastRowsVisible);
		ViewStore.once('change', function() {
			// Queue next update once we have a response
			this.rowVisibilityChangeTimer = setTimeout(this.updateVisibleRows, 3000);
		}.bind(this));
	},

	render: function() {
		var rowData = ViewStore.viewContents[this.props.activeView];
		return (
			<BaseTable ref="flexResizerNotifyProxy" tableKey="torrent" className="TorrentTable"
			columnDescriptions={TorrentColumns.columns} initialColumnOrder={TorrentColumns.initialOrder}
			initialSort={['name', 'ASC']} rowData={rowData} updateVisibleRowKeys={this.handleRowVisibiliyChange} />
		);
	},
});

module.exports = TorrentTable;
