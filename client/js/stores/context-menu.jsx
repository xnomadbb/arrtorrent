var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var log = require('../stores/log').module('ContextMenuStore');

var ContextMenuStore = function() { };

inherits(ContextMenuStore, EventEmitter);

ContextMenuStore.prototype.requestMenu = function(menuOptions, coords) {
	this.emit('requestMenu', menuOptions, coords);
};

module.exports = new ContextMenuStore();
