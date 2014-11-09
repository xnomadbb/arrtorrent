"use strict"; // jshint node: true
var config;

// Attempt to find conf files...
// else:
config = require('./user-config'); // Settings from app folder (the default settings unless fiddled with)

module.exports = config;
