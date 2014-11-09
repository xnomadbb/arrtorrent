"use strict"; // jshint node: true
var JsonRpcClass = require('../client/json-rpc');

function ClientSocket(ws, ArrRpc, rtEvents) {
	console.log('accepted ws connection');
	var JsonRpc = new JsonRpcClass(ws, routeRequest);

	function routeRequest(request) {
		if (false) {
			// something non-rpc to route
			console.log('received request to unroutable method:', request.method);
		} else {
			// A request to go over XML-RPC
			ArrRpc.call(request.method, request.params, function(err, value) {
				if (err !== null) {
					//TODO: See what sorts of errors rtorrent/xmlrpc return, format accordingly
					JsonRpc.sendErrorResponse(request.id, 'XmlRpcError', err.toString());
					console.log('xmlrpc error:', err);
				}
				else {
					JsonRpc.sendResultResponse(request.id, value);
				}
			});
		}
	}

	function relayRtEvent(line) {
		JsonRpc.sendRequest('rtEvent', line);
	}

	rtEvents.on('rtEvent', relayRtEvent);

	ws.on('close', function() {
		console.log('closed ws connection');
		rtEvents.removeListener('rtEvent', relayRtEvent);
	});
}


module.exports = ClientSocket;
