var React = require('react');

module.exports = React.createClass({
	displayName: 'ProgressBar',
	render: function() {
		var completed = parseInt(this.props.completed, 10) || 0;
		return (
			<div className="ProgressBarContainer">
				<div className="ProgressBarProgress" data-completed={completed} />
			</div>
		);
	},
});

