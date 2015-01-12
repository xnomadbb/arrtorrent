const EventEmitter = require('events').EventEmitter;
const sha1 = require('sha1');
const TorrentStore = require('./torrent');
const Constants = require('../constants');

// There are currently views for states, labels, and trackers. rutorrent does searches and feeds as well.
class ViewStore extends EventEmitter {
	constructor() {
		this.viewGroups = {
			// {group id: [view id]}
			'state': ['state_all', 'state_downloading', 'state_complete', 'state_active', 'state_inactive', 'state_error'],
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
			'state_downloading': 'Downloading',
			'state_complete': 'Complete',
			'state_active': 'Active',
			'state_inactive': 'Inactive',
			'state_error': 'Error',
			'label_none': 'None',
		};
		this.viewContents = {
			// {view id: {hash: torrent}}
			// These are all references, shouldn't be too bad on memory
			'state_all': {},
			'state_downloading': {},
			'state_complete': {},
			'state_active': {},
			'state_inactive': {},
			'state_error': {},
			'label_none': {},
		};
		this.viewRtorrentViews = {
			// {view id: rtorrent view name} when applicable
			// We can perform operation on rtorrent-defined views en masse with d.multicall
			// Generally these are only state views, we'd have to maintain other views manually
			//TODO check all of these, correlate with _addTorrentToViews below
			'state_all': 'main',
			'state_downloading': 'leeching',
			'state_complete': 'complete',
			'state_active': 'active',
			//'state_inactive': does this exist?
			//'state_error': does this exist?
			//this.builtinViewIds = ['main', 'default', 'name', 'active', 'started', 'stopped', 'complete', 'incomplete', 'hashing', 'seeding', 'leeching'];
			// Useless?  'default', 'name',
			// rutorrent ratio groups (not sure)?  'rat_0', 'rat_1', 'rat_2', 'rat_3', 'rat_4', 'rat_5', 'rat_6', 'rat_7'
		};

		TorrentStore.on('change', this.torrentsDidChange.bind(this));
	}

	torrentsDidChange(changes) {
		// Remove records for removed and modified torrents (we'll re-add modified)
		for (let i=0; i < this.viewContents.length; i++) {
			let viewTorrents = this.viewContents[i];
			for (let hash in changes.removed) {
				delete viewTorrents[hash];
			}
			for (let hash in changes.modified) {
				delete viewTorrents[hash];
			}
		}

		// Re-add modified torrents
		for (let hash in changes.modified) {
			this._addTorrentToViews(changes.modified[hash]);
		}

		// Add new torrents
		for (let hash in changes.added) {
			this._addTorrentToViews(changes.added[hash]);
		}

		this._pruneEmptyViews();
		this.emit('change');
	}

	_addTorrentToViews(torrent) {
		// Process user-defined label views
		if (torrent.label.length > 0) {
			let viewId = 'label_' + sha1(torrent.label); // CSS-safe unique id
			this._addView(viewId, torrent.label, 'label'); // Ensure view exists
			this.viewContents[viewId][torrent.hash] = torrent;
		} else {
			// Add to no labels
			this.viewContents.label_none[torrent.hash] = torrent;
		}

		// Process state views
		//TODO Check that these are correct and that they correlate 1:1 with builtin view names, they
		//     need to be exactly equivalent or we risk affecting unwanted torrents on batch operations
		this.viewContents.state_all[torrent.hash] = torrent;
		if (torrent.is_complete === '1') {
			this.viewContents.state_complete[torrent.hash] = torrent;
		} else {
			this.viewContents.state_downloading[torrent.hash] = torrent;
		}
		if (torrent.is_active === '1') {
			this.viewContents.state_active[torrent.hash] = torrent;
		} else {
			this.viewContents.state_inactive[torrent.hash] = torrent;
		}
		if (torrent.is_hashing_failed === '1' || torrent.message !== '') {
			this.viewContents.state_error[torrent.hash] = torrent;
		}

		// Process tracker views
		// We group by domain, not announce URL.
		if (torrent.trackers) {
			for (let i=0; i < torrent.trackers.length; i++) {
				let trackerHost = Constants.tracker.urlToDomain(torrent.trackers[i].url);
				let viewId = 'tracker_' + sha1(trackerHost); // CSS-safe unique id
				this._addView(viewId, trackerHost, 'tracker'); // Ensure view exists
				this.viewContents[viewId][torrent.hash] = torrent;
			}
		}
	}

	// Add view to store if it doesn't yet exist
	_addView(viewId, viewName, groupId) {
		if (viewId in this.viewContents) {
			// Already exists
			return;
		}

		this.viewGroups[groupId].push(viewId); //TODO order by viewName or ?
		this.viewNames[viewId] = viewName;
		this.viewContents[viewId] = {};
	}

	_pruneEmptyViews() {
		for (let viewId in this.viewContents) {
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
			let groupId = viewId.split('_')[0];
			let viewIndex = this.viewGroups[groupId].indexOf(viewId);
			this.viewGroups[groupId].splice(viewIndex, 1);
		}
	}
}

module.exports = new ViewStore();
