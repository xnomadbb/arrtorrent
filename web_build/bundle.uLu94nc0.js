(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var jsonrpc = require('./json-rpc');
var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':8080/arr?username=user&password=hackme');
ws.onmessage = function (event) {
	console.log(event.data);
};

},{"./json-rpc":2}],2:[function(require,module,exports){
"use strict"; // jshint node: true

// This is mostly JSON-RPC 1.0 compatible: http://json-rpc.org/wiki/specification
// We give responses to notifications (requests with a null id) rather than silence.
// We send errors on parse failures/etc rather than closing the connection.
// We don't do anything special for JSON class hints.
// We reinvent wheels because plumbing is hard.

function JsonRpc(transport, routeRequest) {
	// transport: must support onmessage property and send method
	// routeRequest(jsonRpcRequest, JsonRpc): must handle given request and call JsonRpc.sendResultResponse or JsonRpc.sendErrorResponse
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvY2xpZW50LmpzIiwiY2xpZW50L2pzb24tcnBjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGpzb25ycGMgPSByZXF1aXJlKCcuL2pzb24tcnBjJyk7XG52YXIgaG9zdCA9IHdpbmRvdy5kb2N1bWVudC5sb2NhdGlvbi5ob3N0LnJlcGxhY2UoLzouKi8sICcnKTtcbnZhciB3cyA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vJyArIGhvc3QgKyAnOjgwODAvYXJyP3VzZXJuYW1lPXVzZXImcGFzc3dvcmQ9aGFja21lJyk7XG53cy5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0Y29uc29sZS5sb2coZXZlbnQuZGF0YSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7IC8vIGpzaGludCBub2RlOiB0cnVlXG5cbi8vIFRoaXMgaXMgbW9zdGx5IEpTT04tUlBDIDEuMCBjb21wYXRpYmxlOiBodHRwOi8vanNvbi1ycGMub3JnL3dpa2kvc3BlY2lmaWNhdGlvblxuLy8gV2UgZ2l2ZSByZXNwb25zZXMgdG8gbm90aWZpY2F0aW9ucyAocmVxdWVzdHMgd2l0aCBhIG51bGwgaWQpIHJhdGhlciB0aGFuIHNpbGVuY2UuXG4vLyBXZSBzZW5kIGVycm9ycyBvbiBwYXJzZSBmYWlsdXJlcy9ldGMgcmF0aGVyIHRoYW4gY2xvc2luZyB0aGUgY29ubmVjdGlvbi5cbi8vIFdlIGRvbid0IGRvIGFueXRoaW5nIHNwZWNpYWwgZm9yIEpTT04gY2xhc3MgaGludHMuXG4vLyBXZSByZWludmVudCB3aGVlbHMgYmVjYXVzZSBwbHVtYmluZyBpcyBoYXJkLlxuXG5mdW5jdGlvbiBKc29uUnBjKHRyYW5zcG9ydCwgcm91dGVSZXF1ZXN0KSB7XG5cdC8vIHRyYW5zcG9ydDogbXVzdCBzdXBwb3J0IG9ubWVzc2FnZSBwcm9wZXJ0eSBhbmQgc2VuZCBtZXRob2Rcblx0Ly8gcm91dGVSZXF1ZXN0KGpzb25ScGNSZXF1ZXN0LCBKc29uUnBjKTogbXVzdCBoYW5kbGUgZ2l2ZW4gcmVxdWVzdCBhbmQgY2FsbCBKc29uUnBjLnNlbmRSZXN1bHRSZXNwb25zZSBvciBKc29uUnBjLnNlbmRFcnJvclJlc3BvbnNlXG5cdHZhciBzZWxmID0gdGhpcztcblx0dmFyIG5leHRPdXRnb2luZ1JlcXVlc3RJZCA9IDE7XG5cdHZhciBwZW5kaW5nUmVxdWVzdENhbGxiYWNrcyA9IHt9O1xuXG5cdHRyYW5zcG9ydC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dmFyIG1lc3NhZ2UgPSBkYXRhLmRhdGE7XG5cdFx0dHJ5IHtcblx0XHRcdG1lc3NhZ2UgPSBKU09OLnBhcnNlKG1lc3NhZ2UpO1xuXHRcdH1cblx0XHRjYXRjaChlKSB7XG5cdFx0XHRzZWxmLnNlbmRFcnJvclJlc3BvbnNlKG51bGwsICdNZXNzYWdlUGFyc2VFcnJvcicsIGUubWVzc2FnZSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBtZXNzYWdlLm1ldGhvZCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vIFNlZW1zIHRvIGJlIHJlcXVlc3Rcblx0XHRcdGlmICh0eXBlb2YgbWVzc2FnZS5tZXRob2QgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdHNlbGYuc2VuZEVycm9yUmVzcG9uc2UobnVsbCwgJ01lc3NhZ2VTdHJ1Y3R1cmVFcnJvcicsICdSZXF1ZXN0IHByb3BlcnR5IFwibWV0aG9kXCIgbXVzdCBiZSBzdHJpbmcnKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UucGFyYW1zKSkge1xuXHRcdFx0XHRzZWxmLnNlbmRFcnJvclJlc3BvbnNlKG51bGwsICdNZXNzYWdlU3RydWN0dXJlRXJyb3InLCAnUmVxdWVzdCBwcm9wZXJ0eSBcInBhcmFtc1wiIG11c3QgYmUgYXJyYXknKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1lc3NhZ2UuaWQgIT09IG51bGwgJiYgKHR5cGVvZiBtZXNzYWdlLmlkICE9PSAnbnVtYmVyJyB8fCBwYXJzZUludChtZXNzYWdlLmlkKSAhPT0gbWVzc2FnZS5pZCkpIHtcblx0XHRcdFx0c2VsZi5zZW5kRXJyb3JSZXNwb25zZShudWxsLCAnTWVzc2FnZVN0cnVjdHVyZUVycm9yJywgJ1JlcXVlc3QgcHJvcGVydHkgXCJpZFwiIG11c3QgYmUgbnVsbCBvciBpbnRlZ2VyJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHJvdXRlUmVxdWVzdChtZXNzYWdlLCBzZWxmKTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBtZXNzYWdlLnJlc3VsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vIFNlZW1zIHRvIGJlIHJlc3BvbnNlXG5cdFx0XHRpZiAodHlwZW9mIG1lc3NhZ2UuaWQgIT09ICdudW1iZXInIHx8IHBhcnNlSW50KG1lc3NhZ2UuaWQpICE9PSBtZXNzYWdlLmlkKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdNZXNzYWdlU3RydWN0dXJlRXJyb3InLCAnUmVwc29uc2UgcHJvcGVydHkgXCJpZFwiIG11c3QgYmUgaW50ZWdlcicpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzZWxmLnJvdXRlUmVzcG9uc2UobWVzc2FnZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGYuc2VuZEVycm9yUmVzcG9uc2UobnVsbCwgJ01lc3NhZ2VTdHJ1Y3R1cmVFcnJvcicsICdDYW5ub3QgZGV0ZXJtaW5lIG1lc3NhZ2UgdHlwZS4nKTtcblx0XHR9XG5cdH07XG5cblx0c2VsZi5zZW5kRXJyb3JSZXNwb25zZSA9IGZ1bmN0aW9uKGlkLCBlcnJvckNvZGUsIGVycm9yTWVzc2FnZSkge1xuXHRcdHZhciByZXNwb25zZSA9IHtcblx0XHRcdHJlc3VsdDogbnVsbCxcblx0XHRcdGlkOiBpZCxcblx0XHRcdGVycm9yOiB7Y29kZTogZXJyb3JDb2RlLCBtZXNzYWdlOiBlcnJvck1lc3NhZ2V9LFxuXHRcdH07XG5cdFx0cmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShyZXNwb25zZSk7XG5cdFx0dHJhbnNwb3J0LnNlbmQocmVzcG9uc2UpO1xuXHR9O1xuXG5cdHNlbGYuc2VuZFJlc3VsdFJlc3BvbnNlID0gZnVuY3Rpb24oaWQsIHJlc3VsdCkge1xuXHRcdHZhciByZXNwb25zZSA9IHtcblx0XHRcdHJlc3VsdDogcmVzdWx0LFxuXHRcdFx0aWQ6IGlkLFxuXHRcdFx0ZXJyb3I6IG51bGwsXG5cdFx0fTtcblx0XHRyZXNwb25zZSA9IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKTtcblx0XHR0cmFuc3BvcnQuc2VuZChyZXNwb25zZSk7XG5cdH07XG5cblx0c2VsZi5zZW5kUmVxdWVzdCA9IGZ1bmN0aW9uKG1ldGhvZCwgcGFyYW1zLCBjYWxsYmFjaykge1xuXHRcdHZhciBpZCA9IG5leHRPdXRnb2luZ1JlcXVlc3RJZCsrO1xuXHRcdHZhciByZXF1ZXN0ID0ge1xuXHRcdFx0aWQ6IGlkLFxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXG5cdFx0XHRwYXJhbXM6IHBhcmFtcyxcblx0XHR9O1xuXHRcdHJlcXVlc3QgPSBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KTtcblx0XHRpZiAoY2FsbGJhY2spIHtcblx0XHRcdHBlbmRpbmdSZXF1ZXN0Q2FsbGJhY2tzW2lkXSA9IGNhbGxiYWNrO1xuXHRcdH1cblx0XHR0cmFuc3BvcnQuc2VuZChyZXF1ZXN0KTtcblx0fTtcblxuXHRzZWxmLnJvdXRlUmVzcG9uc2UgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdGlmIChyZXNwb25zZS5pZCBpbiBwZW5kaW5nUmVxdWVzdENhbGxiYWNrcykge1xuXHRcdFx0dmFyIGNhbGxiYWNrID0gIHBlbmRpbmdSZXF1ZXN0Q2FsbGJhY2tzW3Jlc3BvbnNlLmlkXTtcblx0XHRcdGRlbGV0ZSBwZW5kaW5nUmVxdWVzdENhbGxiYWNrc1tyZXNwb25zZS5pZF07XG5cdFx0XHRjYWxsYmFjayhyZXNwb25zZSk7XG5cdFx0fVxuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpzb25ScGM7XG4iXX0=
