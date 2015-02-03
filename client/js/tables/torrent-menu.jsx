var React = require('react/addons');

// Context menu options for the torrent table
module.exports = function(table, selectedRows) {
	var testOption = {
		key: 'test',
		name: 'Test shit',
		type: 'normal',
		enabled: true,
		handleClick: function() {
			//XXX
			console.log(selectedRows);
		},
	};

	return [testOption];
};
