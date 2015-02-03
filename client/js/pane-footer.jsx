var React = require('react/addons');
var log = require('./stores/log').module('FooterPane');
var ArrRpc = require('./rpc');
var util = require('./util');

var FooterPane = React.createClass({
	getInitialState: function() {
		return {
			upload_rate:    0,
			download_rate:  0,
			upload_total:   0,
			download_total: 0,
		};
	},

	componentWillMount: function() {
		this.updateTotals();
		this.refreshInterval = setInterval(this.updateTotals, 5000);
	},
	componentWillUnmount: function() {
		clearInterval(this.refreshInterval);
	},

	updateTotals: function() {
		ArrRpc.sendRequest('arr.multicall', ['get_up_rate', 'get_down_rate', 'get_up_total', 'get_down_total'], function(response) {
			if (response.error !== null) {
				log.user_error('StatsFailure', 'Failed to fetch totals/rates');
				return;
			}

			var data = response.result;
			this.setState({
				upload_rate:    data[0],
				download_rate:  data[1],
				upload_total:   data[2],
				download_total: data[3],
			});
		}.bind(this));
	},

	render: function() {
		var upload_rate    = util.format.bytesPerSecondToHtml(this.state.upload_rate,   true);
		var download_rate  = util.format.bytesPerSecondToHtml(this.state.download_rate, true);
		var upload_total   = util.format.bytesToHtml(this.state.upload_total,   true);
		var download_total = util.format.bytesToHtml(this.state.download_total, true);

		return (
			<div className="FooterPane">
				<span className="summary upload">
					<span className="current_rate">{upload_rate}</span>
					<span className="traffic_total">{upload_total}</span>
				</span>
				<span className="summary download">
					<span className="current_rate">{download_rate}</span>
					<span className="traffic_total">{download_total}</span>
				</span>
			</div>
		);
	},
});

module.exports = FooterPane;
