var React = require('react');
var ArrRpc = require('./rpc');
var Login = React.createClass({
	handleSubmit: function() {
		var username = this.refs.username.getDOMNode().value;
		var password = this.refs.password.getDOMNode().value;
		try {
			var rpc = new ArrRpc({username, password});
		} catch (e) {
			//TODO Report failure
			console.log('arrrpc init:', e);
			return;
		}

		//TODO Test RPC to ensure it actually works

		// Pass rpc to parent, login has succeeded
		this.props.onsuccess(rpc);
	},
	render: function() {
		return (
			<div className="login-container">
				<input type="text" placeholder="Username" ref="username" className="login-username" />
				<input type="password" placeholder="Password" ref="password" className="login-password" />
				<button onClick={this.handleSubmit} className="login-submit">Login</button>
			</div>
		);
	}
});

module.exports = Login;
