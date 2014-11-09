require('traceur-runtime'); // This seems to have to be *somewhere*, anywhere, to work
var React = require('react');
var ArrTorrent = require('./arrtorrent');

React.render(
	<ArrTorrent />,
	document.getElementById('arr')
);
