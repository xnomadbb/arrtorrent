const React = require('react');
const util = require('./util');
const SidebarItem = require('./sidebar-item');
const ViewStore = require('./stores/view');

class SidebarViews {
	getInitialState() {
		return {
			viewIds: [],
			viewHashes: {},
			viewNames: {}
		};
	}
	componentWillMount() {
		ViewStore.on('change', this.viewDidChange);
	}
	componentWillUnmount() {
		ViewStore.removeListener('change', this.viewDidChange);
	}
	viewDidChange() {
		this.setState({
			viewGroups: ViewStore.viewGroups,
			groupNames: ViewStore.groupNames,
			viewNames: ViewStore.viewNames,
			viewContents: ViewStore.viewContents,
		});
	}
	render() {
		let groupNodes = [];

		for (let groupId in this.state.groupNames) {
			let groupName = this.state.groupNames[groupId];
			let viewNodes = [];
			for (let i=0; i < this.state.viewGroups[groupId].length; i++) {
				let viewId = this.state.viewGroups[groupId][i];
				let viewName = this.state.viewNames[viewId];
				let viewCount = Object.keys(this.state.viewContents[viewId]).length;
				let isActive = viewId === this.props.activeView;
				viewNodes.push(<SidebarItem key={viewId} viewId={viewId} name={viewName} isActive={isActive} count={viewCount} onChoose={this.props.onChoose} />);
			}

			groupNodes.push(
				<div key={groupId} className="viewGroup" data-group-id={groupId}>
					<div className="title">{groupName}</div>
					<ul className="viewList">
						{viewNodes}
					</ul>
				</div>
			);
		}

		return (
			<div className="sidebar">
				{groupNodes}
			</div>
		);
	}
}

module.exports = util.toReactClass(SidebarViews);
