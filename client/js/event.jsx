var EventEmitter = require('events').EventEmitter;
var EventEmitterInstance = new EventEmitter();
module.exports = EventEmitterInstance;

/*
This is a global instance of EventEmitter to use for quick tasks which
don't warrant a store to hold state. React makes it a pain to route
events up or down through multiple layers of components. It suggests
things like using refs and props to communicate but then restricts refs
to one per component.

Currently these events are:

ContextMenuManager.requestMenu(menuOptions, [clientX, clientY]):
	Spawns a context menu, needs to be modal and top-level or else we'd
	need plumbing for anything that could house a menu.

PaneResize(void):
	Fires any time a pane resizes to warn components to check their sizes.

*/
