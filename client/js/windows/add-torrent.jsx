var React = require('react/addons');
var Window = require('../components/window');
var WindowButton = require('../components/window-button');

var AddTorrentWindow = React.createClass({
	render: function() {
		return (
			<Window closeWindow={this.props.closeWindow} title="Add Torrent">
				cocks
			</Window>
		);
	},
});

module.exports = AddTorrentWindow;
