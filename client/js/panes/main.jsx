var React = require('react');
var TorrentTable = require('../torrent/table');
var DetailsPane = require('./details');
var FlexResizerMixin = require('../mixins/flex-resizer');

var MainPane = React.createClass({
	mixins: [FlexResizerMixin],
	render: function() {
		return (
			<div className="MainPane">
				<TorrentTable activeView={this.props.activeView} />
				{ this.flexResizerRenderHandle('y', 'neg') }
				<DetailsPane ref="flexResizerTarget" />
			</div>
		);
	},
});

module.exports = MainPane;
