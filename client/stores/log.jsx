var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

/// Used like this:
//var log = require('./log').module('DerpModule');
//log.warn('HerpOverflow', 'The herping has derped beyond critical mass', 'more', 'arguments', 'here')

// Normal levels are internal/console logs that aren't normally displayed to the user.
// user_ levels are displayed to the user through the log pane.
// notify_ levels make an effort to (intrusively) notify the user.
var levels = {
	debug:        0,
	info:         1,
	warn:         2,
	error:        3,
	user_info:    4,
	user_warn:    5,
	user_error:   6,
	notify_info:  7,
	notify_warn:  8,
	notify_error: 9,
};

var LogStore = function() {
	this.events = {};
	this.eventCounter = 0;
};

inherits(LogStore, EventEmitter);

// Returns a logger for the given module
LogStore.prototype.module = function(module) {
	var logger = {};
	for (level in levels) {
		logger[level] = this.logEvent.bind(this, module, level);
	}
	return logger;
};

// Log event and emit change notification
LogStore.prototype.logEvent = function(module, level, eventCode, messageRest) {
	var eventId = this.eventCounter++;
	var message = [];
	for (var i=3; i < arguments.length; i++) {
		message.push(arguments[i]);
	}
	var eventObj = {
		id: eventId,
		renderHash: eventId,
		timestamp: Math.floor(Date.now() / 1000),
		module: module,
		level: level,
		levelNumber: levels[level],
		eventCode: eventCode,
		message: message,
	};
	this.events[eventId] = eventObj;

	// Send to console
	var consoleArgs = ['[' + eventObj.module + ']', eventObj.eventCode + ':'];
	consoleArgs = [].concat(consoleArgs, eventObj.message);
	if (eventObj.levelNumber === 0) {
		console.debug.apply(console, consoleArgs);
	} else if (eventObj.levelNumber % 3 === 1) { //1,4,7
		console.info.apply(console, consoleArgs);
	} else if (eventObj.levelNumber % 3 === 2) { //2,5,8
		console.warn.apply(console, consoleArgs);
	} else { //3,6,9
		console.error.apply(console, consoleArgs);
	}

	this.emit('change', this.eventObj);
};

var LogStoreInstance = module.exports = new LogStore();
LogStoreInstance.module('LogStore').debug('LogInit', 'Logging initialized');
