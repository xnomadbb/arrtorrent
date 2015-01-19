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
				<div className="FlexResizer" draggable="true" onDragStart={this.flexResizerHandleDragStart} onDrag={this.flexResizerHandleDrag} onDragEnd={this.flexResizerHandleDragEnd} />
				<div ref="flexResizerTarget" flexResizerAxis="y-" className="DetailsPane">Details stuff</div>
			</div>
		);
	},
});
