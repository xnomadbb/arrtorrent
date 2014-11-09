var jsonrpc = require('./json-rpc');
var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':8080/arr?username=user&password=hackme');
ws.onmessage = function (event) {
	console.log(event.data);
};
