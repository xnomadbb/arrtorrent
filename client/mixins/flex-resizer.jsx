var React = require('react');

var FlexResizerMixin = module.exports = {
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
		this.refs.flexResizerHandle.getDOMNode().parentNode.addEventListener('dragover', this.flexResizerHandleDrag);
		window.addEventListener('resize', this.handleWindowResize);
	},
	componentWillUnmount: function() {
		this.refs.flexResizerHandle.getDOMNode().parentNode.removeEventListener('dragover', this.flexResizerHandleDrag);
		window.removeEventListener('resize', this.handleWindowResize);
	},

	handleWindowResize: function() {
		clearTimeout(this.windowResizeDebounce);
		this.windowResizeDebounce = setTimeout(this.handleWindowResizeAction, 5);
	},
	handleWindowResizeAction: function() {
		// Send resize events
		this.flexResizerPropogateNotification(this.refs.flexResizerTarget);
		if (this.refs.flexResizerPassive) {
			this.flexResizerPropogateNotification(this.refs.flexResizerPassive);
		}
	},

	flexResizerHandleDragStart: function(e) {
		e.dataTransfer.setData('arr/flexresizer', 'arr'); // Firefox dumbfuckery
		this.flexSize = this.refs.flexResizerTarget.getDOMNode().getBoundingClientRect();
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
		this.flexSize += this.flexSign * (this.flexLastPos - this.flexStartPos);
		this.refs.flexResizerTarget.getDOMNode().style.flexBasis = this.flexSize + 'px';
		// Not aware of any actual issue from not clearing these, but it makes me nervous
		this.flexSize = this.flexLastPos = this.flexStartPos = undefined;
		// Send resize events
		this.flexResizerPropogateNotification(this.refs.flexResizerTarget);
		if (this.refs.flexResizerPassive) {
			this.flexResizerPropogateNotification(this.refs.flexResizerPassive);
		}
	},
	flexResizerPropogateNotification: function(component) {
		// Call a handleFlexResize method on given component and
		// propogate to any flexResizerNotifyProxy refs recursively.
		while (true) {
			if (component.handleFlexResize) {
				component.handleFlexResize();
			}
			if (component.refs && component.refs.flexResizerNotifyProxy) {
				// Try the next ref in the chain if it exists
				component = component.refs.flexResizerNotifyProxy;
			} else {
				break;
			}
		}
	},
};
