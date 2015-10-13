var React = require('react');
var _ = require('lodash');
var Event = require('../event');
var log = require('../stores/log').module('WindowManager');

var Window = React.createClass({
	render: function() {
		var closeButton = '';
		if (!this.props.disallowClose) {
			closeButton = <span className="WindowClose" onClick={this.props.closeWindow}></span>;
		}
		return (
			<div className="Window">
				<div className="WindowTitleBar">
					<span className="WindowTitleText">{this.props.title}</span>
					{closeButton}
				</div>
				<div className="WindowContents">
					{this.props.children}
				</div>
			</div>
		);
	},
});

module.exports = Window;
