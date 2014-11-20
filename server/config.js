"use strict";
var fs = require('fs');

function loadConfigFromFolder(configFolder) {
	var config = require(configFolder + '/arrtorrent.js');
	config.ssl_key = configFolder + '/server.key';
	config.ssl_cert = configFolder + '/server.crt';
	return config;
}

function configFolderIsValid(configFolder) {
	//TODO Should check more things to provide better feedback
	return fs.existsSync(configFolder + '/arrtorrent.js');
}

function locateConfigFolder() {
	//TODO Do XDG config stuff instead/additionally
	if ('HOME' in process.env) {
		// Load config from home directory
		var homeConfigFolder = process.env.home + '/.config/arrtorrent/';
		if (configFolderIsValid(homeConfigFolder)) {
			return homeConfigFolder;
		}
	}
	var defaultFolder = __dirname + '/../config/';
	if (configFolderIsValid(defaultFolder)) {
		return defaultFolder;
	}
	throw new Error('No valid configuration found.');
}

module.exports = loadConfigFromFolder(locateConfigFolder());
