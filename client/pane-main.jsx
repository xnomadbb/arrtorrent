var React = require('react');
var TorrentTable = require('./tables/torrent');
var FlexResizerMixin = require('./mixins/flex-resizer');

module.exports = React.createClass({
	displayName: 'MainPane',
	mixins: [FlexResizerMixin],
	render: function() {
		return (
			<div className="MainPane">
				<TorrentTable ref="flexResizerPassive" activeView={this.props.activeView} />
				{ this.flexResizerRenderHandle('y', 'neg') }
				<div ref="flexResizerTarget" className="DetailsPane">Details stuff</div>
			</div>
		);
	},
});
