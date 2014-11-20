const React = require('react');
const ToReactClass = require('./to-react-class');

class ArrRoot {
	render() {
		//TODO make ui/etc, obviously
		return <h1>Login Successful</h1>;
	}
}

module.exports = ToReactClass(ArrRoot);
