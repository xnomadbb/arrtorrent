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
	if (!fs.existsSync(configFolder + '/arrtorrent.js')) {
		return false;
	}

	if (!fs.existsSync(configFolder + '/server.key') || !fs.existsSync(configFolder + '/server.crt')) {
		// I'd just do it myself, but node makes a huge fucking production out of blocking for a process.
		//TODO Revisit this once 0.12 is out, child_process.execFileSync should exist then.
		console.error('ERROR: No SSL cert/key found, run ssl_setup in the config folder');
		return false;
	}

	return true;
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
