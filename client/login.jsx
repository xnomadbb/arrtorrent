var React = require('react');
var ArrRpc = require('./rpc');

module.exports = React.createClass({
	displayName: 'Login',
	getInitialState: function() {
		return {
			didAuthFail: null
		};
	},
	handleSubmit: function() {
		var username = this.refs.username.getDOMNode().value;
		var password = this.refs.password.getDOMNode().value;
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
		console.log('auth failed');
		this.setState({didAuthFail: true});
	},
	componentWillUnmount: function() {
		ArrRpc.removeListener('wsError', this.authDidFail);
	},
	componentDidMount: function() {
		// autofocus attribute doesn't work here
		this.refs.username.getDOMNode().focus();
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
