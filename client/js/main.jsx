var React = require('react/addons');
var LoginPane = require('./panes/login');
var RootPane = require('./panes/root');
var ArrRpc = require('./rpc');
var LogStore = require('./stores/log');


var ArrTorrent = React.createClass({
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
			return <RootPane />;
		} else {
			return <LoginPane />;
		}
	},
});


React.render(
	<ArrTorrent />,
	document.getElementById('arr')
);
