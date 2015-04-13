var React = require('react/addons');
var _ = require('lodash');
var classnames = require('classnames');
var ViewStore = require('../stores/view');
var ContextMenuMixin = require('../mixins/context-menu');
var GetMenuOptions = require('../torrent/menu');


var SidebarItem = React.createClass({
	mixins: [ContextMenuMixin],
	handleClick: function() {
		this.props.onChoose(this.props.viewId);
	},
	render: function() {
		var classes = classnames({active: this.props.isActive});
		return <li className={classes} onClick={this.handleClick} title={this.props.tooltip}>
			{this.props.name} ({this.props.count})
		</li>;
	},
});


var SidebarPane = React.createClass({
	componentWillMount: function() {
		ViewStore.on('change', this.viewDidChange);
	},
	componentWillUnmount: function() {
		ViewStore.removeListener('change', this.viewDidChange);
	},
	viewDidChange: function() {
		this.forceUpdate();
	},
	getContextMenuOptions: function(viewId) {
		//TODO add support for rt views where applicable using d.multicall
		var rows = _.values(ViewStore.viewContents[viewId]);
		return GetMenuOptions(rows);
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
				viewNodes.push(
					<SidebarItem key={viewId} viewId={viewId} name={viewName} isActive={isActive} count={viewCount} tooltip={tooltip}
					onChoose={this.props.onChoose} getContextMenuOptions={this.getContextMenuOptions.bind(this, viewId)} />);
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

module.exports = SidebarPane;
