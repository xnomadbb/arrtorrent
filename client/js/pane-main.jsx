var React = require('react');
var TorrentTable = require('./tables/torrent');
var DetailsPane = require('./pane-details');
var FlexResizerMixin = require('./mixins/flex-resizer');

module.exports = React.createClass({
	displayName: 'MainPane',
	mixins: [FlexResizerMixin],
	render: function() {
		return (
			<div className="MainPane">
				<TorrentTable ref="flexResizerPassive" activeView={this.props.activeView} />
				{ this.flexResizerRenderHandle('y', 'neg') }
				<DetailsPane ref="flexResizerTarget" />
			</div>
		);
	},
});
