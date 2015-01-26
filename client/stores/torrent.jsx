const inherits = require('util').inherits;
const sha1 = require('sha1');
const EventEmitter = require('events').EventEmitter;
const LZString = require('lz-string');
const ArrRpc = require('../rpc');
const util = require('../util');

let TorrentStore = function() {
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
	let fieldList = [].concat(util.torrent.commands.immutable, util.torrent.commands.mutable, util.torrent.commands.dynamic);
	this.queryTorrentInfo('main', fieldList);

	// Load from localStorage so we have a functional UI until the initial sync completes
	this._localStorageRestore();
};

// Fetch given fields of given torrents
TorrentStore.prototype.queryTorrentInfo = function(view, fieldList) {
	// Format multicall
	let multicall_args = [view];
	for (let i=0; i < fieldList.length; i++) {
		if (fieldList[i].indexOf('=') === -1) {
			multicall_args.push(fieldList[i] + '=');
		} else {
			multicall_args.push(fieldList[i]);
		}
	}

	ArrRpc.sendRequest('d.multicall', multicall_args, response => {
		// Save results, remove everything not listed if we queried all torrents (main)
		let removeUnlisted = (view === 'main');
		this.mergeTorrentInfo(response.result, fieldList, removeUnlisted);
	});
};

// Merge given torrent info into store and emit change events
TorrentStore.prototype.mergeTorrentInfo = function(infoList, fieldList, removeUnlisted=false) {
	let hashIndex = fieldList.indexOf('d.get_hash');
	if (hashIndex === -1) {
		console.error('Cannot find hash in torrent fieldList', infoList, fieldList); //XXX logging
	}

	// {hash: torrent} of changes
	let changes = {
		added: {},
		removed: {},
		modified: {},
	};

	// Merge info for each torrent
	for (let i=0; i < infoList.length; i++) {
		// Prepare source and dest locations
		let srcInfo = infoList[i];
		let hash = srcInfo[hashIndex];
		let dstInfo = this.torrents[hash];
		if (dstInfo === undefined) {
			// Save reference to new object
			// Note that modified will contain everything in added
			dstInfo = changes.added[hash] = this.torrents[hash] = {};
		}

		// Copy each source field over
		let isModified = false;
		for (let j=0; j < fieldList.length; j++) {
			let command = fieldList[j];
			let fieldName = util.torrent.commandToField[command];

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
			// We need to ensure propertoes are always created in the same order or else we'll get false negatives for render caching.
			// Always grabbing all fields of all torrents on the first query should avoid any issues here.
			dstInfo.renderHash = sha1(JSON.stringify(dstInfo));
		}
	}

	if (removeUnlisted) {
		// Remove anything not in infoList, as infoList contains everything
		let oldHashes = Object.keys(this.torrents);
		let newHashes = new Set(infoList.map(t => { return t[hashIndex]; }));
		// ES6 has sets but no proper set operations ~.~
		for (let i=0; i < oldHashes.length; i++) {
			if (!newHashes.has(oldHashes[i])) {
				changes.removed[oldHashes[i]] = this.torrents[oldHashes[i]];
				delete this.torrents[oldHashes[i]];
			}
		}
	}

	// Save results
	this._localStoragePersist();

	// Tell the world
	this.emit('change', changes);
};

//TODO per-user caches, detect stale caches older than some threshold, don't attempt >5MB, etc. This is a hack atm
TorrentStore.prototype._localStoragePersist = function() {
	localStorage.arr_torrent_cache = LZString.compressToUTF16(JSON.stringify(this.torrents));
};

TorrentStore.prototype._localStorageRestore = function() {
	if (localStorage.arr_torrent_cache) {
		let newTorrents = JSON.parse(LZString.decompressFromUTF16(localStorage.arr_torrent_cache));
		for (let prop in this.torrents) {
			delete this.torrents[prop];
		}
		for (let prop in newTorrents) {
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
