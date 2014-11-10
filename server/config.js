"use strict";
var config;

//TODO Look in usual location for config folder, default to the following
config = require(__dirname + '/../config/arrtorrent');

//TODO Create these paths from config folder
config.ssl_key = __dirname + '/../config/server.key';
config.ssl_cert = __dirname + '/../config/server.crt';

module.exports = config;
