const React = require('react');
const ViewStore = require('../stores/view');
const TorrentColumns = require('./torrent-columns');
const BaseTableHeader = require('./base-header');
const BaseTableBody = require('./base-body');

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
		return (
			<div className="ArrTable TorrentTable">
				<BaseTableHeader columnDescriptions={TorrentColumns} />
				<BaseTableBody   columnDescriptions={TorrentColumns} rowData={rowData} />
			</div>
		);
	},
});
