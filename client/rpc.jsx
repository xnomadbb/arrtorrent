const jsonrpc = require('./json-rpc');
const EventEmitter = require('events').EventEmitter;

class ArrRpc extends EventEmitter {
	configure(options) {
		this.username = options.username || this.username;
		this.password = options.password || this.password;
	}

	createUrl() {
		let scheme = document.location.protocol === 'https:' ? 'wss:' : 'ws:';
		let host = document.location.host;
		let user = this.username;
		let pass = btoa(this.password);
		return `${scheme}//${host}/arr?username=${user}&password=${pass}`;
	}

	isAlive() {
		if (!this.ws || this.ws.readyState === this.ws.CLOSED || this.ws.readyState === this.ws.CLOSING) {
			return false;
		}
		return true;
	}

	connect(wsUrl) {
		if (this.isAlive()) {
			return;
		}

		// JSON-RPC handles all onmessages
		this.ws = new WebSocket(wsUrl);
		this.ws.onopen  = this.wsDidOpen.bind(this);
		this.ws.onerror = this.wsDidError.bind(this);
		this.ws.onclose = this.wsDidClose.bind(this);
	}

	wsDidOpen() {
		// Wait a bit to ensure success, then process open handler
		var authTimer;
		function cancelAuth() {
			clearTimeout(authTimer);
		}
		this.once('wsError', cancelAuth);

		// After wait (if we haven't had an error), proceed and stop listening for errors
		authTimer = setTimeout(() => {
			this.jsonrpc = new jsonrpc(this.ws, this.routeRequests);
			this.sendRequest = this.jsonrpc.sendRequest.bind(this.jsonrpc);
			this.sendRequest('arr.get_config', [], this.configLoad.bind(this));
			this.removeListener('wsError', cancelAuth);
			this.emit('wsOpen');
		}, 300);
	}

	wsDidError() {
		// Close will always fire immediately after error
		this.isErrored = true;
	}

	wsDidClose(event) {
		if (this.isErrored) {
			this.isErrored = false;
			// No use passing around the CloseEvent, everything except wasClean is restricted
			this.emit('wsError');
		}
		this.emit('wsClose');
	}

	configLoad(message) {
		if (!message.error) {
			this.config = message.result;
			this.emit('configLoaded');
		}
	}

	routeRequests(message) {
		// We shouldn't get much here except for rtorrent events
		console.log(message);
	}
}

// We're gonna use this everywhere and it's not "stateful" in the same sense
// that the UI is. Not really interested in passing this around to absolutely
// fucking everywhere. Yay, singleton!
module.exports = new ArrRpc();
window.rpc = module.exports; //XXX DEBUG
