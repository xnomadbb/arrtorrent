var inherits = require('util').inherits;
var sha1 = require('sha1');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var LZString = require('lz-string');
var ArrRpc = require('../rpc');
var util = require('../util');

var TorrentStore = function() {
		//this.builtinViewIds = ['main', 'default', 'name', 'active', 'started', 'stopped', 'complete', 'incomplete', 'hashing', 'seeding', 'leeching'];
		// Useless?  'default', 'name',
		// rutorrent ratio groups (not sure)?  'rat_0', 'rat_1', 'rat_2', 'rat_3', 'rat_4', 'rat_5', 'rat_6', 'rat_7'
		this.torrents = {};
		window.torrents = this.torrents; //XXX DEBUG

		if (ArrRpc.config) {
			this.loadInit();
		} else {
			ArrRpc.once('configLoaded', this.loadInit.bind(this));
		}
};

inherits(TorrentStore, EventEmitter);

TorrentStore.prototype.loadInit = function() {
	// Load all torrent data
	this.allFields = [].concat(util.torrent.commands.immutable, util.torrent.commands.mutable, util.torrent.commands.dynamic);
	var fieldList = this.allFields;
	this.queryViewInfo('main', fieldList);

	// Load from localStorage so we have a functional UI until the initial sync completes
	this._localStorageRestore();

	// Listen for rtorrent stop/start/done/etc events
	ArrRpc.on('rtEvent', this._handleRtEvent.bind(this));
	this._handleRtEventAct = _.debounce(this._handleRtEventAct.bind(this), 250);
};

// Fetch given fields of torrents in given view
TorrentStore.prototype.queryViewInfo = function(view, fieldList) {
	// Format multicall
	var multicall_args = [view];
	for (var i=0; i < fieldList.length; i++) {
		if (fieldList[i].indexOf('=') === -1) {
			multicall_args.push(fieldList[i] + '=');
		} else {
			multicall_args.push(fieldList[i]);
		}
	}

	ArrRpc.sendRequest('d.multicall', multicall_args, function(response) {
		// Save results, remove everything not listed if we queried all torrents (main)
		var removeUnlisted = (view === 'main');
		this.mergeTorrentInfo(response.result, fieldList, removeUnlisted);
	}.bind(this));
};

// Fetch all fields of torrents in given hash list
TorrentStore.prototype.queryHashListInfo = function(hashList) {
	var multicalls = [];

	for (var i=0; i < hashList.length; i++) {
		var hash = hashList[i];
		for (var j=0; j < this.allFields.length; j++) {
			var field = this.allFields[j];
			//FIXME Too hacky, we need to handle single/multicall syntax more cleanly
			if (field === 't.multicall=,t.get_url=,t.get_scrape_complete=,t.get_scrape_incomplete=') {
				multicalls.push(['t.multicall', [hash, 'ignored', 't.get_url=', 't.get_scrape_complete=', 't.get_scrape_incomplete=']]);
			} else {
				multicalls.push([field, hash]);
			}
		}
	}

	ArrRpc.sendRequest('arr.multicall', multicalls, function(response) {
		var results = _.chunk(response.result, this.allFields.length);
		this.mergeTorrentInfo(results, this.allFields, false);
	}.bind(this));
};

// Merge given torrent info into store and emit change events
TorrentStore.prototype.mergeTorrentInfo = function(infoList, fieldList, removeUnlisted) {
	var hashIndex = fieldList.indexOf('d.get_hash');
	if (hashIndex === -1) {
		console.error('Cannot find hash in torrent fieldList', infoList, fieldList); //XXX logging
	}

	// {hash: torrent} of changes
	var changes = {
		added: {},
		removed: {},
		modified: {},
	};

	// Merge info for each torrent
	for (var i=0; i < infoList.length; i++) {
		// Prepare source and dest locations
		var srcInfo = infoList[i];
		var hash = srcInfo[hashIndex];
		var dstInfo = this.torrents[hash];
		if (dstInfo === undefined) {
			// Save reference to new object
			// Note that modified will contain everything in added
			dstInfo = changes.added[hash] = this.torrents[hash] = {};
		}

		// Copy each source field over
		var isModified = false;
		for (var j=0; j < fieldList.length; j++) {
			var command = fieldList[j];
			var fieldName = util.torrent.commandToField[command];

			// Transform results of nested commands
			if (fieldName in util.torrent.complexFieldDeserializers) {
				srcInfo[j] = util.torrent.complexFieldDeserializers[fieldName](srcInfo[j]);
			}

			// Apply changes if differences exist
			if (JSON.stringify(dstInfo[fieldName]) != JSON.stringify(srcInfo[j])) {
				dstInfo[fieldName] = srcInfo[j];
				isModified = true;
			}
		}
		if (isModified) {
			changes.modified[hash] = dstInfo;
			// XXX WARNING XXX
			// JSON output depends on the order in which properties are created (this is implementation-specific, not standard)
			// We need to ensure properties are always created in the same order or else we'll get false negatives for render caching.
			// Always grabbing all fields of all torrents on the first query should avoid any issues here.
			dstInfo.renderHash = sha1(JSON.stringify(dstInfo));
		}
	}

	if (removeUnlisted) {
		// Remove anything not in infoList, as infoList contains everything
		var oldHashes = Object.keys(this.torrents);
		var newHashes = _.pluck(infoList, hashIndex);
		var rmHashes = _.difference(oldHashes, newHashes);
		for (var i=0; i < rmHashes.length; i++) {
			var rmHash = rmHashes[i];
			changes.remove[rmHash] = this.torrents[rmHash];
			delete this.torrents[rmHash];
		}
	}

	// Save results
	this._localStoragePersist();

	// Tell the world
	this.emit('change', changes);
};

TorrentStore.prototype._handleRtEvent = function(message) {
	// These events tend to come in quick bursts, so reload requests are debounced
	if (!this._pendingRtEventHashes) {
		this._pendingRtEventHashes = {
			added: [],
			removed: [],
			modified: [],
		};
	}

	// Queue event processing
	var eventName = message.params[0];
	var hash = message.params[1];
	if (eventName === 'inserted') {
		this._pendingRtEventHashes.added.push(hash);
	} else if (eventName === 'erased') {
		this._pendingRtEventHashes.removed.push(hash);
	} else {
		this._pendingRtEventHashes.modified.push(hash);
	}

	this._handleRtEventAct();
};
TorrentStore.prototype._handleRtEventAct = function() {
	// Grab our hashes and kill the pending object
	var removedHashes = _.uniq(this._pendingRtEventHashes.removed);
	var addedHashes = _.uniq(this._pendingRtEventHashes.added);
	var modifiedHashes = _.difference(_.uniq(this._pendingRtEventHashes.modified), removedHashes, addedHashes);
	delete this._pendingRtEventHashes;

	// Request updates for added/modified
	var rpcHashes = [].concat(addedHashes, modifiedHashes);
	if (rpcHashes.length) {
		this.queryHashListInfo([].concat(addedHashes, modifiedHashes));
	}

	// Send removal event
	if (removedHashes.length) {
		// {hash: torrent} of changes
		var emitChanges = {
			added: {},
			removed: {}, // We'll only be using removed here
			modified: {},
		};

		// Remove torrents and gather changes to emit
		for (var i=0; i < removedHashes.length; i++) {
			emitChanges.removed[removedHashes[i]] = this.torrents[removedHashes[i]];
			delete this.torrents[removedHashes[i]];
		}

		// Tell the world about removed torrents, updated for added/modified will come via RPC
		this.emit('change', emitChanges);
	}
};


//TODO per-user caches, detect stale caches older than some threshold, don't attempt >5MB, etc. This is a hack atm
TorrentStore.prototype._localStoragePersist = function() {
	localStorage.arr_torrent_cache = LZString.compressToUTF16(JSON.stringify(this.torrents));
};

TorrentStore.prototype._localStorageRestore = function() {
	if (localStorage.arr_torrent_cache) {
		var newTorrents = JSON.parse(LZString.decompressFromUTF16(localStorage.arr_torrent_cache));
		for (var prop in this.torrents) {
			delete this.torrents[prop];
		}
		for (var prop in newTorrents) {
			this.torrents[prop] = newTorrents[prop];
		}
		this.emit('change', {
			added: this.torrents,
			removed: {},
			modified: this.torrents,
		});
	}
};

module.exports = new TorrentStore();
