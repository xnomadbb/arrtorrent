const React = require('react');
const ToReactClass = require('./to-react-class');
const ArrRpc = require('./rpc');

class Login {
	handleSubmit() {
		let username = this.refs.username.getDOMNode().value;
		let password = this.refs.password.getDOMNode().value;
		ArrRpc.configure({username, password});
		try {
			ArrRpc.connect(ArrRpc.createUrl());
		} catch (e) {
			//TODO Report failure
			console.log('arrrpc init:', e);
			return;
		}

		//TODO Test RPC to ensure it actually works

		// Login has succeeded, notify parent
		this.props.onsuccess();
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
