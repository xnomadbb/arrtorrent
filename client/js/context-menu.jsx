var React = require('react/addons');
var NativeListener = require('react-native-listener');
var _ = require('lodash');
var Event = require('./event');
var log = require('./stores/log').module('ContextMenu');


var ContextMenu = React.createClass({
	handleClick: function(menuAction) {
		if (menuAction() !== false) {
			this.props.closeMenu();
		}
	},

	renderOption: function(option, i) {
		// option.type is assumed 'normal' unless specified
		// option.enabled is assumed true unless false
		option.type = option.type || 'normal';
		option.enabled = (option.enabled === false) ? false : true;
		if (option.type === 'separator') {
			return <div key={'separator' + i} className="ContextSeparator"></div>;
		}

		var classes = {};
		classes.enabled  =  option.enabled;
		classes.disabled = !option.enabled;
		classes[option.key] = true;

		if (option.type === 'submenu') {
			classes.ContextSubmenu = true;
			classes = React.addons.classSet(classes);
			return (
				<div key={option.key} className={classes}>
					{option.name}
					<ContextMenu options={option.menuOptions} closeMenu={this.props.closeMenu} />
				</div>
			);
		} else {
			// normal
			var onClick = option.enabled ? this.handleClick.bind(this, option.handleClick) : _.noop;
			classes.ContextOption = true;
			classes = React.addons.classSet(classes);
			return (
				<div key={option.key} className={classes} onClick={onClick}>
					{option.name}
				</div>
			);
		}
	},

	render: function() {
		var optionNodes = this.props.options.map(this.renderOption);
		var style = {};
		if (this.props.x && this.props.y) {
			style.left = this.props.x;
			style.top  = this.props.y;
		}
		return (
			<div style={style} className="ContextMenu">
				{optionNodes}
			</div>
		);
	},
});

var ContextMenuManager = React.createClass({
	getInitialState: function() {
		return {
			menuOptions: null,
			menuX: 0,
			menuY: 0,
		};
	},

	componentWillMount: function() {
		Event.on('ContextMenu.requestMenu', this.handleMenuRequest);
	},
	componentWillUnmount: function() {
		Event.removeListener('ContextMenu.requestMenu', this.handleMenuRequest);
	},

	handleMenuRequest: function(menuOptions, coords) {
		this.setState({
			menuOptions: menuOptions,
			menuX: coords[0],
			menuY: coords[1],
		});
	},

	closeMenu: function() {
		this.setState({menuOptions: null});
	},
	nullEvent: function(e) {
		e.stopPropagation();
		e.preventDefault();
		return false;
	},

	render: function() {
		if (this.state.menuOptions === null) {
			return <div className="ContextMenuManager"></div>;
		}

		return (
			<div className="ContextMenuManager active" onMouseDown={this.closeMenu}>
				<NativeListener onMouseDown={this.nullEvent}>
					<ContextMenu options={this.state.menuOptions} x={this.state.menuX} y={this.state.menuY}
					closeMenu={this.closeMenu} onMouseDown={this.nullEvent} />
				</NativeListener>
			</div>
		);
	},
});

module.exports = ContextMenuManager;
