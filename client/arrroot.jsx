const React = require('react');
const ToReactClass = require('./to-react-class');
const SidebarViews = require('./sidebar-views');

class ArrRoot {
	getInitialState() {
		return {
			activeView: 'main'
		};
	}
	changeView(viewId) {
		this.setState({activeView: viewId});
	}
	render() {
		//TODO make ui/etc, obviously
		return <div><h1>Login Successful</h1> <SidebarViews activeView={this.state.activeView} onChange={this.changeView} /></div>;
	}
}

module.exports = ToReactClass(ArrRoot);
