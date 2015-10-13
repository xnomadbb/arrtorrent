var React = require('react');
var _ = require('lodash');
var Event = require('../event');
var log = require('../stores/log').module('WindowManager');

var WindowManager = React.createClass({
	getInitialState: function() {
		return {
			windowClass: null,
			windowProps: {},
		};
	},

	componentWillMount: function() {
		Event.on('WindowManager.requestWindow', this.handleWindowRequest);
	},
	componentWillUnmount: function() {
		Event.removeListener('WindowManager.requestWindow', this.handleWindowRequest);
	},

	handleWindowRequest: function(windowClass, windowProps) {
		this.setState({
			windowClass: windowClass,
			windowProps: windowProps,
		});
	},

	closeWindow: function() {
		this.setState({
			windowClass: null,
		});
	},

	render: function() {
		if (this.state.windowClass === null) {
			return <div className="WindowManager"></div>;
		}

		var WindowClass = this.state.windowClass;
		return (
			<div className="WindowManager active">
				<WindowClass closeWindow={this.closeWindow} {...this.state.windowProps} />
			</div>
		);
	},
});

module.exports = WindowManager;
