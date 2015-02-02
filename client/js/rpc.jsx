var inherits = require('util').inherits;
var jsonrpc = require('./json-rpc');
var EventEmitter = require('events').EventEmitter;
var log = require('./stores/log').module('ArrRpc');

var ArrRpc = function() {};

inherits(ArrRpc, EventEmitter);

ArrRpc.prototype.configure = function(options) {
	this.username = options.username || this.username;
	this.password = options.password || this.password;
};

ArrRpc.prototype.createUrl = function() {
	var scheme = document.location.protocol === 'https:' ? 'wss://' : 'ws://';
	var host = document.location.host;
	var user = this.username;
	var pass = btoa(this.password);
	return scheme + host + '/arr?username=' + user + '&password=' + pass;
};

ArrRpc.prototype.isAlive = function() {
	if (!this.ws || this.ws.readyState === this.ws.CLOSED || this.ws.readyState === this.ws.CLOSING) {
		return false;
	}
	return true;
};

ArrRpc.prototype.connect = function(wsUrl) {
	if (this.isAlive()) {
		return;
	}

	// JSON-RPC handles all onmessages
	this.ws = new WebSocket(wsUrl);
	this.ws.onopen  = this.wsDidOpen.bind(this);
	this.ws.onerror = this.wsDidError.bind(this);
	this.ws.onclose = this.wsDidClose.bind(this);
};

ArrRpc.prototype.wsDidOpen = function() {
	// Wait a bit to ensure success, then process open handler
	var authTimer;
	function cancelAuth() {
		clearTimeout(authTimer);
	}
	this.once('wsError', cancelAuth);

	// After wait (if we haven't had an error), proceed and stop listening for errors
	var router = this.routeRequests.bind(this);
	authTimer = setTimeout(function() {
		this.jsonrpc = new jsonrpc(this.ws, router);
		this.sendRequest = this._sendRequest.bind(this);
		this.sendRequest('arr.get_config', [], this.configLoad.bind(this));
		this.removeListener('wsError', cancelAuth);
		this.emit('wsOpen');
	}.bind(this), 300);
};

ArrRpc.prototype._sendRequest = function(method, params, callback) {
	this.jsonrpc.sendRequest(method, params, function(response) {
		if (response.error !== null) {
			if (response.error.code === 'XmlRpcError') {
				log.user_error('XmlRpcError', response.error.message, [method, params]);
			} else {
				log.user_error('ArrRpcError', response.error, [method, params]);
			}
		}
		callback(response);
	});
};

ArrRpc.prototype.wsDidError = function() {
	// Close will always fire immediately after error
	this.isErrored = true;
};

ArrRpc.prototype.wsDidClose = function(event) {
	if (this.isErrored) {
		this.isErrored = false;
		// No use passing around the CloseEvent, everything except wasClean is restricted
		log.error('WsError', 'websocket closed with error');
		this.emit('wsError');
	}
	log.error('WsError', 'websocket closed');
	this.emit('wsClose');
};

ArrRpc.prototype.configLoad = function(message) {
	if (!message.error) {
		this.config = message.result;
		this.emit('configLoaded');
	}
};

ArrRpc.prototype.routeRequests = function(message) {
	// We shouldn't get much here except for rtorrent events
	log.debug('ServerRequest', 'Received request from server', message);
	this.emit(message.method, message);
};

// We're gonna use this everywhere and it's not "stateful" in the same sense
// that the UI is. Not really interested in passing this around to absolutely
// fucking everywhere. Yay, singleton!
module.exports = new ArrRpc();
window.rpc = module.exports; //XXX DEBUG
