const React = require('react');

let FlexResizerMixin = module.exports = {
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

	flexResizerHandleDragStart: function(e) {
		//console.log('start', e.clientX, e.clientY);
		this.flexSize = this.refs.flexResizerTarget.getDOMNode().getBoundingClientRect();
		this.flexSize = Math.ceil((this.flexAxis === 'x') ? this.flexSize.width : this.flexSize.height);
		this.flexLastPos = (this.flexAxis === 'x') ? e.clientX : e.clientY;
	},
	flexResizerHandleDrag: function(e) {
		//console.log('drag ', e.clientX, e.clientY);
		let newPos = (this.flexAxis === 'x') ? e.clientX : e.clientY;
		if (!newPos) {
			return; // Things like to falsely report 0 near the end of a drag
		}
		this.flexSize += this.flexSign * (newPos - this.flexLastPos);
		this.flexLastPos = newPos;
		this.refs.flexResizerTarget.getDOMNode().style.flexBasis = this.flexSize + 'px';
	},
	flexResizerHandleDragEnd: function(e) {
		// Not aware of any actual issue from not clearing these, but it makes me nervous
		//console.log('end ', e.clientX, e.clientY);
		this.flexSize = this.flexLastPos = undefined;
	},
};
