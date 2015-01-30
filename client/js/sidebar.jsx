var React = require('react');
var SidebarItem = require('./sidebar-item');
var ViewStore = require('./stores/view');

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
		var groupNodes = [];

		for (var groupId in ViewStore.groupNames) {
			var groupName = ViewStore.groupNames[groupId];
			var viewNodes = [];
			for (var i=0; i < ViewStore.viewGroups[groupId].length; i++) {
				var viewId = ViewStore.viewGroups[groupId][i];
				var viewName = ViewStore.viewNames[viewId];
				var tooltip = ViewStore.viewTooltips[viewId];
				var viewCount = Object.keys(ViewStore.viewContents[viewId]).length;
				var isActive = viewId === this.props.activeView;
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
			<div className="Sidebar">
				{groupNodes}
			</div>
		);
	},
});
