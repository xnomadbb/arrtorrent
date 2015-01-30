var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var sha1 = require('sha1');
var TorrentStore = require('./torrent');
var util = require('../util');

// There are currently views for states, labels, and trackers. rutorrent does searches and feeds as well.
var ViewStore = function() {
	TorrentStore.on('change', this.torrentsDidChange.bind(this));
	this.viewGroups = {
		// {group id: [view id]}
		'state': ['state_all', 'state_seeding', 'state_leeching', 'state_active', 'state_stopped', 'state_hashing', 'state_error'],
		'label': ['label_none'],
		'tracker': [],
	};
	this.groupNames = {
		// {group id: group name}
		'state': 'State',
		'label': 'Label',
		'tracker': 'Tracker',
	};
	this.viewNames = {
		// {view id: view name}
		'state_all': 'All',
		'state_seeding': 'Seeding',
		'state_leeching': 'Leeching',
		'state_active': 'Active',
		'state_stopped': 'Stopped',
		'state_hashing': 'Hashing',
		'state_error': 'Error',
		'label_none': 'None',
	};
	this.viewContents = {
		// {view id: {hash: torrent}}
		// These are all references, shouldn't be too bad on memory
		'state_all': {},
		'state_seeding': {},
		'state_leeching': {},
		'state_active': {},
		'state_stopped': {},
		'state_hashing': {},
		'state_error': {},
		'label_none': {},
	};
	this.viewTooltips = {
		// {view id: help text}
		'state_all': 'All torrents',
		'state_seeding': 'Currently seeding (available to upload)',
		'state_leeching': 'Currently leeching (attempting to download)',
		'state_active': 'Currently having upload/download traffic',
		'state_stopped': 'Stopped/finished/paused (closed+incomplete/closed+complete/open but paused)',
		'state_hashing': 'Currently hashing torrent contents or checking hash',
		'state_error': 'Having any error status (not an exclusive state)',
		'label_none': 'Torrents with no label',
	};
	this.viewRtorrentViews = {
		// {view id: rtorrent view name} when applicable
		// We can perform operation on rtorrent-defined views en masse with d.multicall
		// Generally these are only state views, we'd have to maintain other views manually
		//TODO check all of these, correlate with _addTorrentToViews below
		'state_all': 'main',
		//'state_seeding': 'seeding',
		//'state_leeching': 'leeching',
		//'state_active': does this exist?
		//'state_stopped': 'stopped',
		//'state_hashing': 'hashing?',
		//'state_error': does this exist?
		//this.builtinViewIds = ['main', 'default', 'name', 'active', 'started', 'stopped', 'complete', 'incomplete', 'hashing', 'seeding', 'leeching'];
		// Useless?  'default', 'name',
		// rutorrent ratio groups (not sure)?  'rat_0', 'rat_1', 'rat_2', 'rat_3', 'rat_4', 'rat_5', 'rat_6', 'rat_7'
	};
};

inherits(ViewStore, EventEmitter);

ViewStore.prototype.torrentsDidChange = function(changes) {
	// Remove records for removed and modified torrents (we'll re-add modified)
	for (var viewId in this.viewContents) {
		var viewTorrents = this.viewContents[viewId];
		for (var hash in changes.removed) {
			delete viewTorrents[hash];
		}
		for (var hash in changes.modified) {
			delete viewTorrents[hash];
		}
	}

	// Re-add modified torrents
	for (var hash in changes.modified) {
		this._addTorrentToViews(changes.modified[hash]);
	}

	// Add new torrents
	for (var hash in changes.added) {
		this._addTorrentToViews(changes.added[hash]);
	}

	this._pruneEmptyViews();
	this.emit('change');
};

ViewStore.prototype._addTorrentToViews = function(torrent) {
	// Process user-defined label views
	if (torrent.label.length > 0) {
		var viewId = 'label_' + sha1(torrent.label); // CSS-safe unique id
		this._addView(viewId, torrent.label, 'label'); // Ensure view exists
		this.viewContents[viewId][torrent.hash] = torrent;
	} else {
		// Add to no labels
		this.viewContents.label_none[torrent.hash] = torrent;
	}

	// Process state views
	//TODO Check that these are correct and that they correlate 1:1 with builtin view names, they
	//     need to be exactly equivalent or we risk affecting unwanted torrents on batch operations
	var status_error = util.torrent.getStatusFromTorrent(torrent);
	var status = status_error[0];
	var error = status_error[1];

	this.viewContents.state_all[torrent.hash] = torrent;
	if (parseInt(torrent.up_rate) || parseInt(torrent.down_rate)) {
		this.viewContents.state_active[torrent.hash] = torrent;
	}
	if (error) {
		this.viewContents.state_error[torrent.hash] = torrent;
	}
	switch(status) {
		case 'seeding':
			this.viewContents.state_seeding[torrent.hash] = torrent;
			break;
		case 'leeching':
			this.viewContents.state_leeching[torrent.hash] = torrent;
			break;
		case 'stopped':
		case 'finished':
		case 'paused':
			this.viewContents.state_stopped[torrent.hash] = torrent;
			break;
		case 'hashing':
			this.viewContents.state_hashing[torrent.hash] = torrent;
			break;
	}

	// Process tracker views
	// We group by domain, not announce URL.
	if (torrent.trackers) {
		for (var i=0; i < torrent.trackers.length; i++) {
			var trackerHost = util.tracker.urlToDomain(torrent.trackers[i].url);
			var viewId = 'tracker_' + sha1(trackerHost); // CSS-safe unique id
			this._addView(viewId, trackerHost, 'tracker'); // Ensure view exists
			this.viewContents[viewId][torrent.hash] = torrent;
		}
	}
};

// Add view to store if it doesn't yet exist
ViewStore.prototype._addView = function(viewId, viewName, groupId) {
	if (viewId in this.viewContents) {
		// Already exists
		return;
	}

	this.viewGroups[groupId].push(viewId);
	this.viewNames[viewId] = viewName;
	this.viewContents[viewId] = {};
	this._sortViewGroup(groupId);
};

ViewStore.prototype._sortViewGroup = function(groupId) {
	// Only handle label and tracker views, built-in states are presorted as desired
	if (groupId !== 'label' || groupId !== 'tracker') {
		return;
	}

	this.viewGroups[groupId].sort(function(a, b) {
		var aName = this.viewNames[a], bName = this.viewNames[b];

		// No labels is always first
		if (aName === 'label_none') {
			return -1;
		}
		if (bName === 'label_none') {
			return 1;
		}

		// Otherwise sort by name
		return ((aName > bName) - (aName < bName));
	}.bind(this));
};

ViewStore.prototype._pruneEmptyViews = function() {
	for (var viewId in this.viewContents) {
		if (viewId.indexOf('state_') === 0) {
			continue; // State views are rt-builtin
		}
		if (viewId === 'label_none') {
			continue; // No labels is arr-builtin
		}
		if (Object.keys(this.viewContents[viewId]).length > 0) {
			continue; // View not empty
		}

		// View is empty and prunable
		delete this.viewContents[viewId];
		delete this.viewRtorrentViews[viewId];
		delete this.viewNames[viewId];

		// Remove from viewGroups
		var groupId = viewId.split('_')[0];
		var viewIndex = this.viewGroups[groupId].indexOf(viewId);
		this.viewGroups[groupId].splice(viewIndex, 1);
	}
};

module.exports = new ViewStore();
