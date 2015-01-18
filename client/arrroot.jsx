const React = require('react');
const Sidebar = require('./sidebar');
const TorrentTable = require('./tables/torrent');

module.exports = React.createClass({
	displayName: 'ArrRoot',
	getInitialState: function() {
		return {
			activeView: 'state_all'
		};
	},
	changeView: function(viewId) {
		console.log('changed view:', viewId);
		this.setState({activeView: viewId});
	},
	render: function() {
		return (
			<div>
				<Sidebar activeView={this.state.activeView} onChoose={this.changeView} />
				<TorrentTable activeView={this.state.activeView} />
			</div>
		);
	},
});
