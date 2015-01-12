const React = require('react/addons');
const util = require('./util');

class SidebarItem {
	handleClick() {
		this.props.onChoose(this.props.viewId);
	}
	render() {
		let classes = React.addons.classSet({
			'active': this.props.isActive
		});
		return <li className={classes} onClick={this.handleClick}>
			{this.props.name} ({this.props.count})
		</li>;
	}
}

module.exports = util.toReactClass(SidebarItem);
