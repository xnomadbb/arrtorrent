var React = require('react');
var Window = require('../components/window');
var WindowButton = require('../components/window-button');

var CreateTorrentWindow = React.createClass({
	render: function() {
		return (
			<Window closeWindow={this.props.closeWindow} title="Create Torrent">
				cocks
			</Window>
		);
	},
});

module.exports = CreateTorrentWindow;
