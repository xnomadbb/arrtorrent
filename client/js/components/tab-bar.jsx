var React = require('react/addons');
var log = require('../stores/log').module('TabBar');

var TabBar = React.createClass({
	getInitialState: function() {
		return {
			activeTab: this.props.initialTab,
		};
	},

	handleTabClick: function(key) {
		log.debug('ChangeTab', 'Changing active tab', key);
		this.setState({activeTab: key});
	},

	renderTabHeaders: function() {
		var tabOutput = [];
		for (var i=0; i < this.props.children.length; i++) {
			var tabBody = this.props.children[i];
			var tabKey = tabBody.props.tabKey;
			var classes = React.addons.classSet({
				TabHeader: true,
				active:   (this.state.activeTab === tabKey),
				inactive: (this.state.activeTab !== tabKey),
			});
			var tabHeader = (
				<div className={classes} key={tabKey} data-tab={tabKey}
				onClick={this.handleTabClick.bind(this, tabKey)}>
					{tabBody.props.tabName}
				</div>
			);
			tabOutput.push(tabHeader);
		}
		return tabOutput;
	},

	render: function() {
		var tabHeaders = this.renderTabHeaders();
		var tabBodys = [];

		// Have non-active tabs display:none so that state is preserved for them
		for (var i=0; i < this.props.children.length; i++) {
			var tab = this.props.children[i];
			var style = (tab.props.tabKey === this.state.activeTab) ? {} : {display: 'none'};
			tabBodys.push(
				<div key={tab.props.tabKey} className="TabBody" style={style}>
					{tab}
				</div>
			);
		}

		return (
			<div className="TabBar">
				<div className="TabHeaders">{tabHeaders}</div>
				{tabBodys}
			</div>
		);
	},
});

module.exports = TabBar;
