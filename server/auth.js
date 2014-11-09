"use strict"; // jshint node: true
var url = require('url');
var config = require('./config');
var bcrypt = require('bcrypt-nodejs');

function checkCredentials(creds) {
	var username = creds.username || '';
	var password = creds.password || '';

	for (var i=0; i < config.auth.users.length; i++) {
		var user = config.auth.users[i];
		// Order of comparison is important here to prevent username enumeration by timing
		if (bcrypt.compareSync(password, user.password) && username === user.username) {
			return user.username;
		}
	}

	return false;
}

function extractCredentialsFromInfo(info) {
	var query = url.parse(info.req.url, true).query;
	return {
		username: query.username,
		password: new Buffer(query.password, 'base64').toString('binary')
	};
}

function verifyClient(info, cb) {
	var creds = extractCredentialsFromInfo(info);
	var validUser = checkCredentials(creds); // returns false or username

	if (validUser === false) {
		if (typeof cb === 'undefined') {
			return false; // Deny
		}
		cb(false, 403, 'Forbidden'); // Deny
		return false;
	}

	if (typeof cb === 'undefined') {
		return true; // Allow
	}
	cb(true); // Allow
}

module.exports = {
	verifyClient: verifyClient,
};
