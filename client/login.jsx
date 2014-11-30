const React = require('react');
const ToReactClass = require('./to-react-class');
const ArrRpc = require('./rpc');

class Login {
	handleSubmit() {
		let username = this.refs.username.getDOMNode().value;
		let password = this.refs.password.getDOMNode().value;
		ArrRpc.configure({username, password});
		ArrRpc.once('wsError', this.authDidFail);
		ArrRpc.connect(ArrRpc.createUrl());
	}
	authDidFail() {
		//TODO Report to user
		console.log('auth failed');
	}
	componentWillUnmount() {
		ArrRpc.removeListener('wsError', this.authDidFail);
	}
	render() {
		return (
			<div className="login-container">
				<input type="text" placeholder="Username" ref="username" className="login-username" />
				<input type="password" placeholder="Password" ref="password" className="login-password" />
				<button onClick={this.handleSubmit} className="login-submit">Login</button>
			</div>
		);
	}
}

module.exports = ToReactClass(Login);
