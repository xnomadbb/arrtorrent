const React = require('react');
const ToReactClass = require('./to-react-class');
const Sidebar = require('./sidebar');

class ArrRoot {
	getInitialState() {
		return {
			activeView: 'main'
		};
	}
	changeView(viewId) {
		console.log('changed view:', viewId);
		this.setState({activeView: viewId});
	}
	render() {
		return (
			<div>
				<h1>Login Successful</h1>
				<Sidebar activeView={this.state.activeView} onChoose={this.changeView} />
			</div>
		);
	}
}

module.exports = ToReactClass(ArrRoot);
