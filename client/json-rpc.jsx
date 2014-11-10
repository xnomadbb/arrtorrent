// This is mostly JSON-RPC 1.0 compatible: http://json-rpc.org/wiki/specification
// We give responses to notifications (requests with a null id) rather than silence.
// We send errors on parse failures/etc rather than closing the connection.
// We don't do anything special for JSON class hints.
// We reinvent wheels because plumbing is hard.

function JsonRpc(transport, routeRequest) {
	// transport: must support onmessage property and send method
	// routeRequest(jsonRpcRequest, JsonRpc): must handle given request and call JsonRpc.sendResultResponse or JsonRpc.sendErrorResponse
	"use strict";
	var self = this;
	var nextOutgoingRequestId = 1;
	var pendingRequestCallbacks = {};

	transport.onmessage = function(data) {
		var message = data.data;
		try {
			message = JSON.parse(message);
		}
		catch(e) {
			self.sendErrorResponse(null, 'MessageParseError', e.message);
			return;
		}

		if (typeof message.method !== 'undefined') {
			// Seems to be request
			if (typeof message.method !== 'string') {
				self.sendErrorResponse(null, 'MessageStructureError', 'Request property "method" must be string');
				return;
			}
			if (!Array.isArray(message.params)) {
				self.sendErrorResponse(null, 'MessageStructureError', 'Request property "params" must be array');
				return;
			}
			if (message.id !== null && (typeof message.id !== 'number' || parseInt(message.id) !== message.id)) {
				self.sendErrorResponse(null, 'MessageStructureError', 'Request property "id" must be null or integer');
				return;
			}
			routeRequest(message, self);
		} else if (typeof message.result !== 'undefined') {
			// Seems to be response
			if (typeof message.id !== 'number' || parseInt(message.id) !== message.id) {
				console.log('MessageStructureError', 'Repsonse property "id" must be integer');
				return;
			}
			self.routeResponse(message);
		} else {
			self.sendErrorResponse(null, 'MessageStructureError', 'Cannot determine message type.');
		}
	};

	self.sendErrorResponse = function(id, errorCode, errorMessage) {
		var response = {
			result: null,
			id: id,
			error: {code: errorCode, message: errorMessage},
		};
		response = JSON.stringify(response);
		transport.send(response);
	};

	self.sendResultResponse = function(id, result) {
		var response = {
			result: result,
			id: id,
			error: null,
		};
		response = JSON.stringify(response);
		transport.send(response);
	};

	self.sendRequest = function(method, params, callback) {
		var id = nextOutgoingRequestId++;
		var request = {
			id: id,
			method: method,
			params: params,
		};
		request = JSON.stringify(request);
		if (callback) {
			pendingRequestCallbacks[id] = callback;
		}
		transport.send(request);
	};

	self.routeResponse = function(response) {
		if (response.id in pendingRequestCallbacks) {
			var callback =  pendingRequestCallbacks[response.id];
			delete pendingRequestCallbacks[response.id];
			callback(response);
		}
	};
}

module.exports = JsonRpc;
