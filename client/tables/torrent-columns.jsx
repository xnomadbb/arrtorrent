const React = require('react');
const util = require('../util');

module.exports = [
	{
		key: 'name',
		name: 'Name',
		getSortKey: row => { return row.name; },
		renderCellContents: row => { return row.name; },
	},
	{
		key: 'size',
		name: 'Size',
		getSortKey: row => { return row.size_bytes; },
		renderCellContents: row => {  return util.format.bytesToHtml(row.size_bytes); },
	},
];
