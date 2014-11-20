const jsonrpc = require('./json-rpc');

class ArrRpc {
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

	connect(wsUrl) {
		this.ws = new WebSocket(wsUrl);
		this.jsonrpc = new jsonrpc(this.ws, this.routeRequests);
		this.sendRequest = this.jsonrpc.sendRequest.bind(this.jsonrpc);
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
