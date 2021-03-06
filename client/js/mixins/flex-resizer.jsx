var React = require('react');
var ReactDOM = require('react-dom');
var Event = require('../event');

var FlexResizerMixin = {
	// Requires:
	// - flexResizerTarget ref on element to be resized
	// - render handle with flexResizerRenderHandle, suppling the axis ('x' or 'y') and sign ('pos' or 'neg') of growth
	flexResizerRenderHandle: function(axis, sign) {
		this.flexAxis = axis;
		this.flexSign = (sign === 'pos') ? 1 : -1;
		return (
			<div ref="flexResizerHandle" className="FlexResizer" data-axis={axis} draggable="true"
			onDragStart={this.flexResizerHandleDragStart} onDrag={this.flexResizerHandleDrag} onDragEnd={this.flexResizerHandleDragEnd} />
		);
	},

	// These are only necessary for Firefox which doesn't provide clientX/Y on drag events, only dragover
	componentDidMount: function() {
		var flexResizerHandle = ReactDOM.findDOMNode(this.refs.flexResizerHandle);
		flexResizerHandle.parentNode.addEventListener('dragover', this.flexResizerHandleDrag);
		window.addEventListener('resize', this.handleWindowResize);
	},
	componentWillUnmount: function() {
		var flexResizerHandle = ReactDOM.findDOMNode(this.refs.flexResizerHandle);
		flexResizerHandle.parentNode.removeEventListener('dragover', this.flexResizerHandleDrag);
		window.removeEventListener('resize', this.handleWindowResize);
	},

	handleWindowResize: function() {
		clearTimeout(this.windowResizeDebounce);
		this.windowResizeDebounce = setTimeout(this.handleWindowResizeAction, 5);
	},
	handleWindowResizeAction: function() {
		// Send resize event
		Event.emit('PaneResize');
	},

	flexResizerHandleDragStart: function(e) {
		e.dataTransfer.setData(JSON.stringify({
			'action': 'flex_resize',
		}), 'arr');
		var flexResizerTarget = ReactDOM.findDOMNode(this.refs.flexResizerTarget);
		this.flexSize = flexResizerTarget.getBoundingClientRect();
		this.flexSize = Math.ceil((this.flexAxis === 'x') ? this.flexSize.width : this.flexSize.height);
		this.flexStartPos = this.flexLastPos = (this.flexAxis === 'x') ? e.clientX : e.clientY;
	},
	flexResizerHandleDrag: function(e) {
		var newPos = (this.flexAxis === 'x') ? e.clientX : e.clientY;
		if (!newPos) {
			return; // Things like to falsely report 0 near the end of a drag
		}
		this.flexLastPos = newPos;
	},
	flexResizerHandleDragEnd: function(e) {
		var flexResizerTarget = ReactDOM.findDOMNode(this.refs.flexResizerTarget);
		this.flexSize += this.flexSign * (this.flexLastPos - this.flexStartPos);
		flexResizerTarget.style.flexBasis = this.flexSize + 'px';
		// Not aware of any actual issue from not clearing these, but it makes me nervous
		this.flexSize = this.flexLastPos = this.flexStartPos = undefined;
		// Send resize event
		Event.emit('PaneResize');
	},
};

module.exports = FlexResizerMixin;
