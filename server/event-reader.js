"use strict";
var net = require('net');
var fs = require('fs');
var events = require('events');
var carrier = require('carrier'); // Separates into lines

function readEvents(sockFile) {

	// lol documentation:
	// >fs.exists() is an anachronism and exists only for historical reasons. There should almost never be a reason to use it in your own code.
	// But listening on a socket which already exists throws an error *and* trying to remove a file which doesn't exist throws an error.
	// So I should never use this function, which is the only way to avoid an error. Right, sockets and files are such anachronisms anyways.
	if(fs.existsSync(sockFile)) {
		fs.unlinkSync(sockFile);
	}

	var emitter = new events.EventEmitter();

	var server = net.createServer(function(sock) {
		carrier.carry(sock, function(line) {
			console.log('received:', line);
			emitter.emit('rtEvent', JSON.parse(line));
		});
	});

	server.listen(sockFile);
	return emitter;
}

module.exports = {
	readEvents: readEvents,
};
