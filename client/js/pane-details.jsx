var React = require('react');
var LogTable = require('./tables/log');

module.exports = React.createClass({
	displayName: 'DetailsPane',
	render: function() {
		return (
			<div className="DetailsPane">
				<LogTable ref="flexResizerNotifyProxy" />
			</div>
		);
	},
});
