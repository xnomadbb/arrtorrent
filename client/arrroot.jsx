var React = require('react');
var Sidebar = require('./sidebar');
var MainPane = require('./pane-main');
var FlexResizerMixin = require('./mixins/flex-resizer');

module.exports = React.createClass({
	displayName: 'ArrRoot',
	mixins: [FlexResizerMixin],
	getInitialState: function() {
		return {
			activeView: 'state_all',
		};
	},
	changeView: function(viewId) {
		console.log('changed view:', viewId);
		this.setState({activeView: viewId});
	},
	render: function() {
		return (
			<div className="ArrRoot">
				<div className="HeaderPane">Header stuff</div>
				<div className="CenterPane">
					<Sidebar ref="flexResizerTarget" activeView={this.state.activeView} onChoose={this.changeView} />
					{ this.flexResizerRenderHandle('x', 'pos') }
					<MainPane activeView={this.state.activeView} />
				</div>
				<div className="FooterPane">Footer stuff</div>
			</div>
		);
	},
});
