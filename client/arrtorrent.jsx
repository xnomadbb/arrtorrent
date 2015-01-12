const React = require('react');
const util = require('./util');
const Login = require('./login');
const ArrRoot = require('./arrroot');
const ArrRpc = require('./rpc');

class ArrTorrent {
	getInitialState() {
		return {
			isAuthenticated: false,
		};
	}
	componentWillMount() {
		ArrRpc.on('wsOpen', this.rpcDidOpen);
	}
	componentWillUnmount() {
		ArrRpc.removeListener('wsOpen', this.rpcDidOpen);
	}
	rpcDidOpen() {
		// We don't account for credential changes here; once authenticated, we assume it stays that way.
		this.setState({
			isAuthenticated: true,
		});
	}
	render() {
		if (this.state.isAuthenticated) {
			return <ArrRoot />;
		} else {
			return <Login />;
		}
	}
}

module.exports = util.toReactClass(ArrTorrent);
