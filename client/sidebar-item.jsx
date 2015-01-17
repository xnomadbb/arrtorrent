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
		return <li className={classes} onClick={this.handleClick}>
			{this.props.name} ({this.props.count})
		</li>;
	},
});
