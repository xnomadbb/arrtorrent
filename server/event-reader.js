"use strict";
var net = require('net');
var fs = require('fs');
var events = require('events');
var timers = require('timers');

module.exports = function(sockFile, ArrRpc) {
	// lol documentation:
	// >fs.exists() is an anachronism and exists only for historical reasons. There should almost never be a reason to use it in your own code.
	// But listening on a socket which already exists throws an error *and* trying to remove a file which doesn't exist throws an error.
	// So I should never use this function, which is the only way to avoid an error. Right, sockets and files are such anachronisms anyways.
	if(fs.existsSync(sockFile)) {
		fs.unlinkSync(sockFile);
	}

	var emitter = new events.EventEmitter();

	var initializeSocket = function() {
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
	};

	// Add event.* methods to receive events from rtorrent
	var addEventMethods = function() {
		var eventCmd = __dirname + '/event-piper.js';
		var eventTypes = ['closed', 'erased', 'finished', 'hash_done', 'hash_queued', 'hash_removed', 'inserted', 'inserted_new', 'inserted_session', 'opened', 'paused', 'resumed'];
		var calls = [];
		for (var i=0; i < eventTypes.length; i++) {
			var event = eventTypes[i];
			var action = 'execute_nothrow=' + eventCmd + ',' + event + ',$d.get_hash=';
			calls.push(['system.method.set_key', ['event.download.' + event, 'arr_event_' + event, action]]);
		}
		ArrRpc.call('arr.multicall', calls, function(err, value){
			if (err !== null) {
				console.log(err);
				// Keep trying until these are added successfully
				timers.setTimeout(addEventMethods, 5000);
			}
		});
	};

	initializeSocket();
	addEventMethods();
	return emitter;
};
