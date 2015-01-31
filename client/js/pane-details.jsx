var React = require('react/addons');
var LogTable = require('./tables/log');

var DetailsPane = React.createClass({
	render: function() {
		return (
			<div className="DetailsPane">
				<LogTable ref="flexResizerNotifyProxy" />
			</div>
		);
	},
});

module.exports = DetailsPane;
