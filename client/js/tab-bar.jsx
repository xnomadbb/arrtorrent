var React = require('react/addons');
var log = require('./stores/log').module('TabBar');

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
		var tabBody;

		for (var i=0; i < this.props.children.length; i++) {
			var tab = this.props.children[i];
			if (tab.props.tabKey !== this.state.activeTab) {
				continue;
			}
			tabBody = tab;
			break;
		}

		return (
			<div className="TabBar">
				<div className="TabHeaders">{tabHeaders}</div>
				<div className="TabBody">
					{tabBody}
				</div>
			</div>
		);
	},
});

module.exports = TabBar;
