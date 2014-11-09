var React = require('react');
var Login = require('./login');
var ArrRoot = require('./arrroot');
var ArrTorrent = React.createClass({
	getInitialState: function() {
		return {
			isAuthenticated: false,
			rpc: null
		}
	},
	onLogin: function(rpc) {
		this.setState({
			isAuthenticated: true,
			rpc: rpc
		});
	},
	render: function() {
		if (this.state.isAuthenticated) {
			return <ArrRoot rpc={this.state.rpc} />;
		} else {
			return <Login onsuccess={this.onLogin} />;
		}
	}
});

module.exports = ArrTorrent;
