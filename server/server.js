#!/usr/bin/env node
"use strict"; // jshint node: true
var http = require('http');
var express = require('express');
var WebSocketServer = require('ws').Server;
var auth = require('./auth');
var config = require('./config');
var xmlrpc = require('./xmlrpc-socket');
var ArrRPC = require('./arr-rpc');
var ClientSocket = require('./client-socket');
var EventReader = require('./event-reader');

var app = express();
app.use(express.static(__dirname + '/../web_build'));

var server = http.createServer(app);
server.listen(config.port);

var raw_rpc = new xmlrpc({sockFile: config.rtorrent.socket});
var arr_rpc = new ArrRPC(raw_rpc);

var rtEvents = EventReader.readEvents(config.rtorrent.eventSocket);

var wss = new WebSocketServer({server: server, path: "/arr", verifyClient: auth.verifyClient});
wss.on('connection', function(ws) {
	new ClientSocket(ws, arr_rpc, rtEvents);
});

