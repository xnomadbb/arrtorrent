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
			<div className="ArrRoot">
				<div className="HeaderPane">Header stuff</div>
				<div className="CenterPane">
					<Sidebar activeView={this.state.activeView} onChoose={this.changeView} />
					<div className="FlexResizer"></div>
					<div className="MainPane">
						<TorrentTable activeView={this.state.activeView} />
						<div className="FlexResizer"></div>
						<div className="DetailsPane">Details stuff</div>
					</div>
				</div>
				<div className="FooterPane">Footer stuff</div>
			</div>
		);
	},
});
