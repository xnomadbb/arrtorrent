const React = require('react');
const ToReactClass = require('./to-react-class');
const TorrentStore = require('./store-torrent');
const SidebarItem = require('./sidebar-item');

class SidebarViews {
	getInitialState() {
		return {
			viewIds: [],
			viewHashes: {},
			viewNames: {}
		};
	}
	componentWillMount() {
		TorrentStore.on('view.change', this.viewDidChange);
	}
	componentWillUnmount() {
		TorrentStore.removeListener('view.change', this.viewDidChange);
	}
	viewDidChange() {
		this.setState({
			viewIds: TorrentStore.viewIds,
			viewHashes: TorrentStore.viewHashes,
			viewNames: TorrentStore.viewNames
		});
	}
	render() {
		let children = [];

		for (let i=0; i < this.state.viewIds.length; i++) {
			let viewId = this.state.viewIds[i];
			let isActive = viewId === this.props.activeView;

			let count = this.state.viewHashes[viewId];
			count = count ? count.length : 0;

			let name = this.state.viewNames[viewId];
			name = name ? name : 'Unknown View';

			children.push(<SidebarItem key={viewId} viewId={viewId} name={name} isActive={isActive} count={count} onChange={this.props.onChange} />);
		}

		return <ul>{ children }</ul>;
	}
}

module.exports = ToReactClass(SidebarViews);
