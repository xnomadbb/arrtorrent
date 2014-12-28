const React = require('react/addons');
const ToReactClass = require('./to-react-class');

class SidebarItem {
	handleClick() {
		this.props.onChange(this.props.name);
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

module.exports = ToReactClass(SidebarItem);
