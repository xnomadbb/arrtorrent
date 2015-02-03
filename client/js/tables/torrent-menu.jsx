var React = require('react/addons');
var _ = require('lodash');
var ArrRpc = require('../rpc');
var log = require('../stores/log').module('TorrentMenu');

function isTorrentStoppedOrPaused(t) {
	return (t.is_active === '0' || t.mystery_state === '0');
}

// Context menu options for the torrent table
module.exports = function(table, selectedRows) {
	var startOption = {
		key: 'start',
		name: 'Start',
		type: 'normal',
		enabled: _.some(selectedRows, isTorrentStoppedOrPaused),
		handleClick: function() {
			var rows = _.filter(selectedRows, isTorrentStoppedOrPaused);
			var calls = [];
			for (var i=0; i < rows.length; i++) {
				var torrent = rows[i];
				if (torrent.mystery_state === '0') {
					// Stopped
					calls.push(['d.start', torrent.hash]);
				} else {
					// Paused
					calls.push(['d.resume', torrent.hash]);
				}
			}

			if (calls.length) {
				ArrRpc.sendRequest('arr.multicall', calls, function(response) {
					if (response.error !== null) {
						log.user_error('StartFail', 'Failed to start/resume torrents', response.error);
					} else {
						log.user_info('StartSuccess', 'Successfully started/resumed torrents', calls.length);
					}
				});
			}
		},
	};

	var pauseOption = {
		key: 'pause',
		name: 'Pause',
		type: 'normal',
		enabled: _.some(selectedRows, {is_active: '1'}),
		handleClick: function() {
			var rows = _.filter(selectedRows, {is_active: '1'});
			var calls = [];
			for (var i=0; i < rows.length; i++) {
				calls.push(['d.pause', rows[i].hash]);
			}

			if (calls.length) {
				ArrRpc.sendRequest('arr.multicall', calls, function(response) {
					if (response.error !== null) {
						log.user_error('PauseFail', 'Failed to pause torrents', response.error);
					} else {
						log.user_info('PauseSuccess', 'Successfully paused torrents', calls.length);
					}
				});
			}
		},
	};

	var stopOption = {
		key: 'stop',
		name: 'Stop',
		type: 'normal',
		enabled: _.some(selectedRows, {mystery_state: '1'}),
		handleClick: function() {
			var rows = _.filter(selectedRows, {mystery_state: '1'});
			var calls = [];
			for (var i=0; i < rows.length; i++) {
				calls.push(['d.stop', rows[i].hash]);
			}

			if (calls.length) {
				ArrRpc.sendRequest('arr.multicall', calls, function(response) {
					if (response.error !== null) {
						log.user_error('StopFail', 'Failed to stop torrents', response.error);
					} else {
						log.user_info('StopSuccess', 'Successfully stopped torrents', calls.length);
					}
				});
			}
		},
	};

	var hashOption = {
		key: 'hash',
		name: 'Force Recheck',
		type: 'normal',
		enabled: true,
		handleClick: function() {
			var calls = [];
			for (var i=0; i < selectedRows.length; i++) {
				calls.push(['d.check_hash', selectedRows[i].hash]);
			}

			ArrRpc.sendRequest('arr.multicall', calls, function(response) {
				if (response.error !== null) {
					log.user_error('CheckFail', 'Failed to begin checking torrents', response.error);
				} else {
					log.user_info('CheckSuccess', 'Successfully began checking torrents', calls.length);
				}
			});
		},
	};

	var announceOption = {
		key: 'announce',
		name: 'Update Trackers',
		type: 'normal',
		enabled: true,
		handleClick: function() {
			var calls = [];
			for (var i=0; i < selectedRows.length; i++) {
				calls.push(['d.tracker_announnce', selectedRows[i].hash]);
			}

			ArrRpc.sendRequest('arr.multicall', calls, function(response) {
				if (response.error !== null) {
					log.user_error('AnnounceFail', 'Failed to announce torrents', response.error);
				} else {
					log.user_info('AnnounceSuccess', 'Successfully announced torrents', calls.length);
				}
			});
		},
	};

	return [
		startOption, pauseOption, stopOption,
		{type: 'separator'},
		hashOption, announceOption,
	];
};
