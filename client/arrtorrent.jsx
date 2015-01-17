const React = require('react');
const Login = require('./login');
const ArrRoot = require('./arrroot');
const ArrRpc = require('./rpc');

module.exports = React.createClass({
	displayName: 'ArrTorrent',
	getInitialState: function() {
		return {
			isAuthenticated: false,
		};
	},
	componentWillMount: function() {
		ArrRpc.on('wsOpen', this.rpcDidOpen);
	},
	componentWillUnmount: function() {
		ArrRpc.removeListener('wsOpen', this.rpcDidOpen);
	},
	rpcDidOpen: function() {
		// We don't account for credential changes here; once authenticated, we assume it stays that way.
		this.setState({
			isAuthenticated: true,
		});
	},
	render: function() {
		if (this.state.isAuthenticated) {
			return <ArrRoot />;
		} else {
			return <Login />;
		}
	},
});
