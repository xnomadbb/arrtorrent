const React = require('react');
const Login = require('./login');
const ArrRoot = require('./arrroot');

class ArrTorrent {
	getInitialState() {
		return {
			isAuthenticated: false,
			rpc: null
		}
	}
	onLogin(rpc) {
		this.setState({
			isAuthenticated: true,
			rpc: rpc
		});
	}
	render() {
		if (this.state.isAuthenticated) {
			return <ArrRoot rpc={this.state.rpc} />;
		} else {
			return <Login onsuccess={this.onLogin} />;
		}
	}
}

module.exports = React.createClass(ArrTorrent.prototype);
