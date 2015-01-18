const React = require('react');
const SidebarItem = require('./sidebar-item');
const ViewStore = require('./stores/view');

module.exports = React.createClass({
	displayName: 'SidebarViews',
	componentWillMount: function() {
		ViewStore.on('change', this.viewDidChange);
	},
	componentWillUnmount: function() {
		ViewStore.removeListener('change', this.viewDidChange);
	},
	viewDidChange: function() {
		this.forceUpdate();
	},
	render: function() {
		let groupNodes = [];

		for (let groupId in ViewStore.groupNames) {
			let groupName = ViewStore.groupNames[groupId];
			let viewNodes = [];
			for (let i=0; i < ViewStore.viewGroups[groupId].length; i++) {
				let viewId = ViewStore.viewGroups[groupId][i];
				let viewName = ViewStore.viewNames[viewId];
				let tooltip = ViewStore.viewTooltips[viewId];
				let viewCount = Object.keys(ViewStore.viewContents[viewId]).length;
				let isActive = viewId === this.props.activeView;
				viewNodes.push(<SidebarItem key={viewId} viewId={viewId} name={viewName} isActive={isActive} count={viewCount} tooltip={tooltip} onChoose={this.props.onChoose} />);
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
			<div className="ArrSidebar">
				{groupNodes}
			</div>
		);
	},
});
