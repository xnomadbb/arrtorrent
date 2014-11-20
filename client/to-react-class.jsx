const React = require('react');

// Custom tranformation to turn an es6-style class into something React likes:
// - displayName is only generated via JSX when a React.createClass is assigned
//   directly to an identifier. displayName gives us pretty labels in devtools,
//   so that's nice to have.

module.exports = function(es6class) {
	"use strict";
	var prototype = Object.assign({displayName: es6class.name}, es6class.prototype);
	return React.createClass(prototype);
};
