var React = require('react/addons');
var SidebarPane = require('./pane-sidebar');
var MainPane = require('./pane-main');
var FlexResizerMixin = require('./mixins/flex-resizer');
var log = require('./stores/log').module('RootPane');

var RootPane = React.createClass({
	mixins: [FlexResizerMixin],
	getInitialState: function() {
		return {
			activeView: 'state_all',
		};
	},
	changeView: function(viewId) {
		log.debug('ViewChange', 'Changed active view', viewId);
		this.setState({activeView: viewId});
	},
	render: function() {
		return (
			<div className="RootPane">
				<div className="HeaderPane">Header stuff</div>
				<div className="CenterPane">
					<SidebarPane ref="flexResizerTarget" activeView={this.state.activeView} onChoose={this.changeView} />
					{ this.flexResizerRenderHandle('x', 'pos') }
					<MainPane activeView={this.state.activeView} />
				</div>
				<div className="FooterPane">Footer stuff</div>
			</div>
		);
	},
});

module.exports = RootPane;
