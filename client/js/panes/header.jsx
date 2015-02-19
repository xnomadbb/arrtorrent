var React = require('react/addons');
var log = require('../stores/log').module('HeaderPane');
var Event = require('../event');
var AddTorrentWindow = require('../windows/add-torrent');
var CreateTorrentWindow = require('../windows/create-torrent');


var HeaderButton = React.createClass({
	handleAction: function() {
		this.props.action();
	},
	render: function() {
		return (
			<span className={"HeaderButton " + (this.props.className || '')} onClick={this.handleAction} title={this.props.tooltip}></span>
		);
	},
});

var HeaderPane = React.createClass({
	handleAdd: function() {
		log.debug('AddOpen', 'Opening add torrent window');
		Event.emit('WindowManager.requestWindow', AddTorrentWindow);
	},
	handleCreate: function() {
		log.debug('CreateOpen', 'Opening create torrent window');
		Event.emit('WindowManager.requestWindow', CreateTorrentWindow);
	},

	render: function() {
		var buttonData = [
			{
				key: 'add',
				tooltip: 'Add Torrent',
				action: this.handleAdd,
			},
			{
				key: 'create',
				tooltip: 'Create Torrent',
				action: this.handleCreate,
			},
		];

		var buttons = buttonData.map(function(button) {
			return <HeaderButton tooltip={button.tooltip} key={button.key} className={button.key} action={button.action} />;
		});

		return (
			<div className="HeaderPane">{buttons}</div>
		);
	},
});

module.exports = HeaderPane;
