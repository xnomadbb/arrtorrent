#!/usr/bin/env node
"use strict"; // jshint node: true
var payload = JSON.stringify(process.argv.slice(2));
var config = require('./config');
var sock = require('net').createConnection(config.rtorrent.eventSocket, function() {
	sock.end(payload);
});
