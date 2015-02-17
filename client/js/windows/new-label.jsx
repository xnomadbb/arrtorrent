var React = require('react/addons');
var Window = require('../components/window');
var WindowButton = require('../components/window-button');

var NewLabelWindow = React.createClass({
	handleSubmit: function() {
		var newLabel = this.refs.labelInput.getDOMNode().value;
		this.props.onSubmit(newLabel);
		this.props.closeWindow();
	},
	componentDidMount: function() {
		this.refs.labelInput.getDOMNode().focus();
	},
	render: function() {
		return (
			<Window closeWindow={this.props.closeWindow} title="Create New Label">
				<label className="WindowLabel" htmlFor="newLabel">Enter the new label for the selected torrents</label>
				<input className="WindowInput" ref="labelInput" type="text" id="newLabel" />
				<WindowButton action={this.handleSubmit}>OK</WindowButton>
				<WindowButton action={this.props.closeWindow}>Cancel</WindowButton>
			</Window>
		);
	},
});

module.exports = NewLabelWindow;
