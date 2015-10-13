var React = require('react');
var _ = require('lodash');
var ArrRpc = require('../rpc');
var ViewStore = require('../stores/view');
var TorrentStore = require('../stores/torrent');
var log = require('../stores/log').module('TorrentMenu');
var Event = require('../event');
var NewLabelWindow = require('../windows/new-label');

function isTorrentStoppedOrPaused(t) {
	return (t.is_active === '0' || t.mystery_state === '0');
}

// Context menu options for torrents
module.exports = function(selectedRows) {
	var hashes = [];
	for (var i=0; i < selectedRows.length; i++) {
		hashes.push(selectedRows[i].hash);
	}

	var startOption = {
		key: 'start',
		name: 'Start',
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

	//TODO Add new label option
	var labelsOption = {
		key: 'labels',
		name: 'Labels',
		type: 'submenu',
		menuOptions: [].concat(
			ViewStore.viewGroups.label.map(function(viewId) {
				var viewName = ViewStore.viewNames[viewId];
				var labelValue = (viewId === 'label_none') ? '' : viewName;
				return {
					key: viewId,
					name: viewName,
					handleClick: function() {
						var calls = [];
						for (var i=0; i < hashes.length; i++) {
							calls.push(['d.set_custom1', [hashes[i], labelValue]]);
						}

						ArrRpc.sendRequest('arr.multicall', calls, function(response) {
							if (response.error !== null) {
								log.user_error('LabelFail', 'Failed to change label', response.error);
							} else {
								log.user_info('LabelSuccess', 'Successfully changed label', calls.length);
							}

							TorrentStore.queryHashListInfo(hashes);
						});
					},
				};
			}),
			{type: 'separator'},
			{
				key: 'newlabel',
				name: 'New Label',
				handleClick: function() {
					Event.emit('WindowManager.requestWindow', NewLabelWindow, {onSubmit: function(newLabel) {
						var calls = [];
						for (var i=0; i < hashes.length; i++) {
							calls.push(['d.set_custom1', [hashes[i], newLabel]]);
						}

						ArrRpc.sendRequest('arr.multicall', calls, function(response) {
							if (response.error !== null) {
								log.user_error('LabelNewFail', 'Failed to add label', response.error);
							} else {
								log.user_info('LabelNewSuccess', 'Successfully added label', calls.length);
							}

							TorrentStore.queryHashListInfo(hashes);
						});
					}});
				},
			}
		),
	};

	var priorityOption = {
		key: 'priority',
		name: 'Priority',
		type: 'submenu',
		menuOptions: [
			['3', 'High'],
			['2', 'Normal'],
			['1', 'Low'],
			['0', 'Ignore'],
		].map(function(p) {
			var value = p[0];
			var name = p[1];
			return {
				key: value,
				name: name,
				handleClick: function() {
					var calls = [];
					for (var i=0; i < hashes.length; i++) {
						calls.push(['d.set_priority', [hashes[i], value]]);
					}

					ArrRpc.sendRequest('arr.multicall', calls, function(response) {
						if (response.error !== null) {
							log.user_error('PriorityFail', 'Failed to change priority', response.error);
						} else {
							log.user_info('PrioritySuccess', 'Successfully changed priority', calls.length);
						}

						TorrentStore.queryHashListInfo(hashes);
					});
				},
			};
		}),
	};


	return [
		startOption, pauseOption, stopOption,
		hashOption, announceOption,
		{type: 'separator'},
		labelsOption, priorityOption
	];
};
