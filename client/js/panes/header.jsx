var React = require('react/addons');
var log = require('../stores/log').module('HeaderPane');
var ArrRpc = require('../rpc');
var util = require('../util');

var HeaderPane = React.createClass({

	render: function() {
		return (
			<div className="HeaderPane">
				Header stuff
			</div>
		);
	},
});

module.exports = HeaderPane;
