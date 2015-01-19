let FlexResizerMixin = module.exports = {
	// Requires:
	// - flexResizerTarget ref
	// - flexResizerAxis prop on the target ref, one of 'x+' 'x-' 'y+' 'y-', indicating axis and direction of growth
	// - draggable="true" attribute on .FlexResizer
	// - onDrag, onDragStart, onDragEnd bound from .FlexResizer to mixin methods
	flexResizerHandleDragStart: function(e) {
		//console.log('start', e.clientX, e.clientY);
		//this.refs.flexResizerTarget.getDOMNode().style.backgroundColor = '#F00';
		this.flexAxis = this.refs.flexResizerTarget.props.flexResizerAxis[0];
		this.flexSign = (this.refs.flexResizerTarget.props.flexResizerAxis[1] === '+') ? 1 : -1;
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
		this.flexAxis = this.flexSign = this.flexSize = this.flexLastPos = undefined;
	},
};
