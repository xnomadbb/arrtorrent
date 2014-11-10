"use strict";
var net          = require('net'),
    scgiStream   = require('scgi-stream'),
    Serializer   = require('xmlrpc/lib/serializer'),
    Deserializer = require('xmlrpc/lib/deserializer');

/**
 * Creates a Client object for making XML-RPC method calls over a Unix domain socket.
 *
 * @constructor
 * @param {Object} options - Options to make the request to.
 *   - {String} sockFile              - path to domain socket
 * @return {Client}
 */
function Client(options) {
	// Invokes with new if called without
	if (false === (this instanceof Client)) {
		return new Client(options);
	}

	options.headers = options.headers || {};
	options.path = options.path || '/';

	// Set the HTTP request headers
	var headers = {
		'Connection': 'Keep-Alive'
	};

	for (var attribute in headers) {
		if (options.headers[attribute] === undefined) {
			options.headers[attribute] = headers[attribute];
		}
	}

	options.method = 'POST';
	this.options = options;
	this.sockFile = options.sockFile;
	this.options.sockFile = undefined;

	this.headersProcessors = {
		processors: [],
		composeRequest: function(headers) {
			this.processors.forEach(function(p) {p.composeRequest(headers);});
		},
		parseResponse: function(headers) {
			this.processors.forEach(function(p) {p.parseResponse(headers);});
		}
	};
}

/**
 * Makes an XML-RPC call to the server specified by the constructor's options.
 *
 * @param {String} method     - The method name.
 * @param {Array} params      - Params to send in the call.
 * @param {Function} callback - function(error, value) { ... }
 *   - {Object|null} error    - Any errors when making the call, otherwise null.
 *   - {mixed} value          - The value returned in the method response.
 */
Client.prototype.methodCall = function methodCall(method, params, callback) {
	var xml       = Serializer.serializeMethodCall(method, params);
	var options   = this.options;

	options.headers['Content-Length'] = Buffer.byteLength(xml, 'utf8');
	this.headersProcessors.composeRequest(options.headers);
	options.stream = net.createConnection(this.sockFile);

	var handler = function(response) {
		if (response.statusCode === 404) {
			callback(new Error('Not Found'));
		}
		else {
			this.headersProcessors.parseResponse(response.headers);
			var deserializer = new Deserializer(options.responseEncoding);
			deserializer.deserializeMethodResponse(response, callback);
		}
	}.bind(this);

	var request = scgiStream.request(options);
	request.on('response', handler);
	request.on('error', callback);
	request.write(xml, 'utf8');
	request.end();
};

module.exports = Client;
