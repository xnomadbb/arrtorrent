const React = require('react/addons');

module.exports = React.createClass({
	displayName: 'SidebarItem',
	handleClick: function() {
		this.props.onChoose(this.props.viewId);
	},
	render: function() {
		let classes = React.addons.classSet({
			'active': this.props.isActive
		});
		var attrs = {};
		if (this.props.tooltip) {
			attrs.title = this.props.tooltip;
		}
		return <li className={classes} onClick={this.handleClick} {...attrs}>
			{this.props.name} ({this.props.count})
		</li>;
	},
});
