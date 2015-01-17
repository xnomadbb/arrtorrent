const React = require('react');
const Sidebar = require('./sidebar');

module.exports = React.createClass({
	displayName: 'ArrRoot',
	getInitialState: function() {
		return {
			activeView: 'main'
		};
	},
	changeView: function(viewId) {
		console.log('changed view:', viewId);
		this.setState({activeView: viewId});
	},
	render: function() {
		return (
			<div>
				<h1>Login Successful</h1>
				<Sidebar activeView={this.state.activeView} onChoose={this.changeView} />
			</div>
		);
	},
});
