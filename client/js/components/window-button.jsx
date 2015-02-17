var React = require('react/addons');

var WindowButton = React.createClass({
	handleAction: function() {
		this.props.action();
	},
	render: function() {
		return (
			<span className={"WindowButton " + (this.props.className || '')} onClick={this.handleAction}>
				{this.props.children}
			</span>
		);
	}
});

module.exports = WindowButton;
