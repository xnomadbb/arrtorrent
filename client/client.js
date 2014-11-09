var jsonrpc = require('./json-rpc');

var ws = new WebSocket('wss://' + document.location.host + '/arr?username=user&password=' + btoa('hackme'));
ws.onmessage = function (event) {
	console.log(event.data);
};
