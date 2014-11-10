require('traceur-runtime'); // This seems to have to be *somewhere*, anywhere, to work
const React = require('react');
const ArrTorrent = require('./arrtorrent');

React.render(
	<ArrTorrent />,
	document.getElementById('arr')
);
