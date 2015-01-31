var React = require('react/addons');
var TorrentTable = require('./tables/torrent');
var DetailsPane = require('./pane-details');
var FlexResizerMixin = require('./mixins/flex-resizer');

var MainPane = React.createClass({
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

module.exports = MainPane;
