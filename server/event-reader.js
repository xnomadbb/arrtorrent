"use strict";
var net = require('net');
var fs = require('fs');
var events = require('events');

module.exports = function(sockFile) {
	// lol documentation:
	// >fs.exists() is an anachronism and exists only for historical reasons. There should almost never be a reason to use it in your own code.
	// But listening on a socket which already exists throws an error *and* trying to remove a file which doesn't exist throws an error.
	// So I should never use this function, which is the only way to avoid an error. Right, sockets and files are such anachronisms anyways.
	if(fs.existsSync(sockFile)) {
		fs.unlinkSync(sockFile);
	}

	var emitter = new events.EventEmitter();

	var server = net.createServer(function(sock) {
		sock.on('data', function(data) {
			// This can in theory return only part of a line, but in practice we
			// only receive a word and a hash at a time so I think it'll be okay.
			data = JSON.parse(data.toString());
			console.log('received:', data);
			emitter.emit('rtEvent', data);
		});
	});

	server.listen(sockFile);
	return emitter;
};
