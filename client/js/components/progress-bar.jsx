var React = require('react/addons');

var ProgressBar = React.createClass({
	render: function() {
		var completed = parseInt(this.props.completed, 10) || 0;
		return (
			<div className="ProgressBarContainer">
				<div className="ProgressBarProgress" data-completed={completed} />
			</div>
		);
	},
});

module.exports = ProgressBar;
