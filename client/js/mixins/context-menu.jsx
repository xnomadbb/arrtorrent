var React = require('react');
var ReactDOM = require('react-dom');
var Event = require('../event');

var ContextMenuMixin = {
	componentDidMount: function() {
		ReactDOM.findDOMNode(this).addEventListener('contextmenu', this.handleContextMenu);
	},
	componentWillUnmount: function() {
		ReactDOM.findDOMNode(this).removeEventListener('contextmenu', this.handleContextMenu);
	},
	handleContextMenu: function(e) {
		var coords = [e.clientX, e.clientY];
		if (this.props.getContextMenuOptions) {
			var menuOptions = this.props.getContextMenuOptions();
			if (menuOptions) {
				Event.emit('ContextMenuManager.requestMenu', menuOptions, coords);
				e.preventDefault();
			}
		}
	},
};

module.exports = ContextMenuMixin;
