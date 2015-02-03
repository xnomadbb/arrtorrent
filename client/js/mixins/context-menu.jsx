var React = require('react/addons');
var ContextMenuStore = require('../stores/context-menu');

var ContextMenuMixin = {
	componentDidMount: function() {
		this.getDOMNode().addEventListener('contextmenu', this.handleContextMenu);
	},
	componentWillUnmount: function() {
		this.getDOMNode().removeEventListener('contextmenu', this.handleContextMenu);
	},
	handleContextMenu: function(e) {
		var coords = [e.clientX, e.clientY];
		if (this.props.getContextMenuOptions) {
			var menuOptions = this.props.getContextMenuOptions();
			if (menuOptions) {
				ContextMenuStore.requestMenu(menuOptions, coords);
				e.preventDefault();
			}
		}
	},
};

module.exports = ContextMenuMixin;
