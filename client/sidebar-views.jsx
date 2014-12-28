const React = require('react');
const ToReactClass = require('./to-react-class');
const TorrentStore = require('./store-torrent');
const SidebarItem = require('./sidebar-item');

class SidebarViews {
	getInitialState() {
		return {
			views: {}
		};
	}
	componentWillMount() {
		TorrentStore.on('view.change', this.viewDidChange);
	}
	componentWillUnmount() {
		TorrentStore.removeListener('view.change', this.viewDidChange);
	}
	viewDidChange() {
		this.setState({'views': TorrentStore.viewHashes});
	}
	render() {
		let children = [];
		let views = this.state.views;
		for (var name in views) {
			let count = views[name] ? views[name].length : 0;
			let isActive = name === this.props.activeView;
			children.push(<SidebarItem key={name} isActive={isActive} onChange={this.props.onChange} name={name} count={count} />);
		}

		return <ul>{ children }</ul>;
	}
}

module.exports = ToReactClass(SidebarViews);
