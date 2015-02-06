var React = require('react/addons');
var LogTable = require('./tables/log');
var TabBar = require('./tab-bar');

var DetailsPane = React.createClass({
	render: function() {
		return (
			<div className="DetailsPane">
				<TabBar initialTab="log">
					<LogTable tabName="Log" tabKey="log"/>
					<div tabName="derp" tabKey="derp">Cocks</div>
				</TabBar>
			</div>
		);
	},
});

module.exports = DetailsPane;
