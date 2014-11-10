const jsonrpc = require('./json-rpc');

class ArrRpc {
	constructor(options) {
		this.username = options.username;
		this.password = options.password;
		this.connect(this.createUrl());
	}

	createUrl() {
		let scheme = document.location.protocol === 'https:' ? 'wss:' : 'ws:';
		let host = document.location.host;
		let user = this.username;
		let pass = btoa(this.password);
		return `${scheme}//${host}/arr?username=${user}&password=${pass}`;
	}

	connect(wsUrl) {
		//TODO: Make this useful, hook up to JSON-RPC, etc
		var ws = new WebSocket(wsUrl);
		ws.onmessage = e => console.log(e.data);
	}
}

module.exports = ArrRpc;
