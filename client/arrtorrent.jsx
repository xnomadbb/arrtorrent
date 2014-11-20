const React = require('react');
const ToReactClass = require('./to-react-class');
const Login = require('./login');
const ArrRoot = require('./arrroot');

class ArrTorrent {
	getInitialState() {
		return {
			isAuthenticated: false,
		};
	}
	onLogin() {
		this.setState({
			isAuthenticated: true,
		});
	}
	render() {
		if (this.state.isAuthenticated) {
			return <ArrRoot />;
		} else {
			return <Login onsuccess={this.onLogin} />;
		}
	}
}

module.exports = ToReactClass(ArrTorrent);
