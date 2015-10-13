var React = require('react');
var _ = require('lodash');
var ViewStore = require('../stores/view');
var TorrentStore = require('../stores/torrent');
var TorrentColumns = require('./columns');
var GetMenuOptions = require('./menu');
var BaseTable = require('../components/base-table');

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
		// rowsVisible isn't in state because it's not "state" in the sense that it
		// directly affects rendering. It would make more sense for this component to
		// own the visible row keys and pass them to the table, but then all of the
		// sorting/viewport/etc logic would need to be here. This is just used to figure
		// out when to poll rtorrent for changes to the currently visible torrents.
		this.rowsVisible = visibleRowKeys;
		this.updateVisibleRows();
	},
	updateVisibleRows: _.debounce(function() {
		// Request new data from rtorrent
		TorrentStore.queryHashListInfo(this.rowsVisible);
	}, 3000),

	render: function() {
		var rowData = ViewStore.viewContents[this.props.activeView];
		return (
			<BaseTable tableKey="torrent" className="TorrentTable"
			columnDescriptions={TorrentColumns.columns} initialColumnOrder={TorrentColumns.initialOrder}
			initialSort={['name', 'ASC']} rowData={rowData} updateVisibleRowKeys={this.handleRowVisibiliyChange}
			getContextMenuOptions={GetMenuOptions} />
		);
	},
});

module.exports = TorrentTable;
