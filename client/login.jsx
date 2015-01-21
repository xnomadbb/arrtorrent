const React = require('react');
const ArrRpc = require('./rpc');

module.exports = React.createClass({
	displayName: 'Login',
	getInitialState: function() {
		return {
			didAuthFail: null
		};
	},
	handleSubmit: function() {
		let username = this.refs.username.getDOMNode().value;
		let password = this.refs.password.getDOMNode().value;
		ArrRpc.configure({username, password});
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
		let authFail = this.state.didAuthFail ? (<div className="authFail">Authentication failed</div>) : '';
		return (
			<div className="login-container" onKeyPress={this.handleKeyPress}>
				<div className="welcome">arr</div>
				<input type="text" placeholder="Username" ref="username" className="login-username" />
				<input type="password" placeholder="Password" ref="password" className="login-password" />
				<button onClick={this.handleSubmit} className="login-submit">Login</button>
				{authFail}
			</div>
		);
	},
});
