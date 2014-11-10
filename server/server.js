#!/usr/bin/env node
"use strict";
var config = require('./config');

// Setup express to serve our web root
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/../web_build'));

// Configure server
var https = require('https');
var fs = require('fs');
var server = https.createServer({
	key: fs.readFileSync(config.ssl_key),
	cert: fs.readFileSync(config.ssl_cert),
}, app);
server.listen(config.port);

// Initialize XMLRPC
var xmlrpc = require('./xmlrpc-socket');
var ArrRPC = require('./arr-rpc');
var raw_rpc = new xmlrpc({sockFile: config.rtorrent.socket});
var arr_rpc = new ArrRPC(raw_rpc);

// Listen for events from rtorrent (pause, resume, hashing, etc)
var EventReader = require('./event-reader');
var rtEvents = EventReader.readEvents(config.rtorrent.eventSocket);

// Expose XMLRPC over websockets
var WebSocketServer = require('ws').Server;
var auth = require('./auth');
var ClientSocket = require('./client-socket');
var wss = new WebSocketServer({server: server, path: "/arr", verifyClient: auth.verifyClient});
wss.on('connection', function(ws) {
	new ClientSocket(ws, arr_rpc, rtEvents);
});

