const React = require('react');
const TorrentTable = require('./tables/torrent');
const FlexResizerMixin = require('./mixins/flex-resizer');

module.exports = React.createClass({
	displayName: 'MainPane',
	mixins: [FlexResizerMixin],
	render: function() {
		return (
			<div className="MainPane">
				<TorrentTable activeView={this.props.activeView} />
				{ this.flexResizerRenderHandle('y', 'neg') }
				<div ref="flexResizerTarget" className="DetailsPane">Details stuff</div>
			</div>
		);
	},
});
