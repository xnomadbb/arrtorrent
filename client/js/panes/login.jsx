var React = require('react');
var ArrRpc = require('../rpc');
var log = require('../stores/log').module('ArrRoot');

var LoginPane = React.createClass({
	getInitialState: function() {
		return {
			didAuthFail: null
		};
	},
	handleSubmit: function() {
		var username = this.refs.username.value;
		var password = this.refs.password.value;
		ArrRpc.configure({username: username, password: password});
		ArrRpc.once('wsError', this.authDidFail);
		ArrRpc.connect(ArrRpc.createUrl());
		this.setState({didAuthFail: null});
	},
	handleKeyPress: function(e) {
		if (e.charCode === 13) {
			this.handleSubmit();
		}
	},
	authDidFail: function() {
		log.user_error('Login', 'AuthFail', 'Authentication to the arr websocket failed');
		this.setState({didAuthFail: true});
	},
	componentWillUnmount: function() {
		ArrRpc.removeListener('wsError', this.authDidFail);
	},
	componentDidMount: function() {
		// autofocus attribute doesn't work here
		this.refs.username.focus();
	},
	render: function() {
		var authFail = this.state.didAuthFail ? (<div className="authFail">Authentication failed</div>) : '';
		return (
			<div className="login-container" onKeyPress={this.handleKeyPress}>
				<div className="welcome">arr</div>
				<input type="text" name="user" placeholder="Username" ref="username" className="login-username" />
				<input type="password" name="password" placeholder="Password" ref="password" className="login-password" />
				<button onClick={this.handleSubmit} className="login-submit">Login</button>
				{authFail}
			</div>
		);
	},
});

module.exports = LoginPane;
