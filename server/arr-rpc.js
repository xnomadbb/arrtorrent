"use strict";
var config = require('./config');

function ArrRPC(xmlrpc) {
	this.xmlrpc = xmlrpc;

	// Methods to be intercepted
	this._magicMethods = {
		'arr.multicall': this._multicall.bind(this),
		'arr.get_config': this._getConfig.bind(this)
	};

	this._addEventMethods();
}

// xmlrpc.methodCall with some niceties
ArrRPC.prototype.call = function(method, params, callback) {
	if (method in this._magicMethods) {
		this._magicMethods[method](params, callback);
		return;
	}
	params = this._prepareParams(params);
	this.xmlrpc.methodCall(method, params, callback);
};

// A less verbose system.multicall, because xmlrpc loves to deeply nest arrays pointlessly
// calls: Array of [methodName, paramArray] pairs or methodNames
// callback: (err, values)
ArrRPC.prototype._multicall = function(calls, callback) {
	var allParams = [];
	for (var i=0; i < calls.length; i++) {
		if (!Array.isArray(calls[i])) {
			calls[i] = [calls[i]];
		}
		var params = this._prepareParams(calls[i][1]);
		allParams.push({methodName: calls[i][0], params: params});
	}
	this.call('system.multicall', [allParams], function(err, values) {
		if (err !== null) {
			// Don't touch anything on error
			callback(err, values);
			return;
		}

		// Unpack values on success, xmlrpc has layers of arrays for no apparent reason
		var simpleValues = [];
		for (var i=0; i < values.length; i++) {
			simpleValues.push(values[i][0]);
		}

		callback(err, simpleValues);
	});
};

ArrRPC.prototype._getConfigBlacklist = ['auth']; // Config keys not to expose
ArrRPC.prototype._getConfig = function(params, callback) {
	//XXX Is config guaranteed to be JSONable?
	var safeConfig = JSON.parse(JSON.stringify(config)); // Deep clone
	for (var i=0; i < this._getConfigBlacklist.length; i++) {
		delete safeConfig[this._getConfigBlacklist[i]];
	}

	callback(null, safeConfig);
};

ArrRPC.prototype._prepareParams = function(params) {
	if (typeof params === 'undefined') {
		// Automatically add mandatory argument
		params = [''];
	}
	else if (!Array.isArray(params)) {
		// Automatically wrap scalars in an array
		params = [params];
	}
	return params;
};

// Add event.* methods to receive events from rtorrent
ArrRPC.prototype._addEventMethods = function() {
	var eventCmd = __dirname + '/event-piper.js';
	var eventTypes = ['closed', 'erased', 'finished', 'hash_done', 'hash_queued', 'hash_removed', 'inserted', 'inserted_new', 'inserted_session', 'opened', 'paused', 'resumed'];
	var calls = [];
	for (var i=0; i < eventTypes.length; i++) {
		var event = eventTypes[i];
		var action = 'execute_nothrow=' + eventCmd + ',' + event + ',$d.get_hash=,$d.get_name=';
		calls.push(['system.method.set_key', ['event.download.' + event, 'arr_event_' + event, action]]);
	}
	this.call('arr.multicall', calls, function(){});
};

module.exports = ArrRPC;
