const EventEmitter = require('events').EventEmitter;
const ArrRpc = require('./rpc');
const Constants = require('./constants');

class TorrentStore extends EventEmitter {
	constructor() {
		//this.builtinViewIds = ['main', 'default', 'name', 'active', 'started', 'stopped', 'complete', 'incomplete', 'hashing', 'seeding', 'leeching'];
		// Useless?  'default', 'name',
		// rutorrent ratio groups (not sure)?  'rat_0', 'rat_1', 'rat_2', 'rat_3', 'rat_4', 'rat_5', 'rat_6', 'rat_7'
		this.torrents = {};

		if (ArrRpc.config) {
			this.loadInit();
		} else {
			ArrRpc.once('configLoaded', this.loadInit.bind(this));
		}
	}

	loadInit() {
		//TODO cache torrents in localstorage so we can start displaying immediately?

		// Load all torrent data
		let fieldList = [].concat(Constants.torrent.commands.immutable, Constants.torrent.commands.mutable, Constants.torrent.commands.dynamic);
		this.queryTorrentInfo('main', fieldList);
	}

	// Fetch given fields of given torrents
	queryTorrentInfo(view, fieldList) {
		// Format multicall
		let multicall_args = [view];
		for (let i=0; i < fieldList.length; i++) {
			multicall_args.push(fieldList[i] + '=');
		}

		ArrRpc.sendRequest('d.multicall', multicall_args, response => {
			// Save results, remove everything not listed if we queried all torrents (main)
			let removeUnlisted = (view === 'main');
			this.mergeTorrentInfo(response.result, fieldList, removeUnlisted);
		});
	}

	// Merge given torrent info into store and emit change events
	mergeTorrentInfo(infoList, fieldList, removeUnlisted=false) {
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
				let fieldName = Constants.torrent.commandToField[fieldList[j]];
				if (dstInfo[fieldName] !== srcInfo[j]) {
					dstInfo[fieldName] = srcInfo[j];
					isModified = true;
				}
			}
			if (isModified) {
				changes.modified[hash] = dstInfo;
			}
		}

		if (removeUnlisted) {
			// Remove anything not in infoList, as infoList contains everything
			let oldHashes = Object.keys(this.torrents);
			let newHashes = new Set([for (t of infoList) t[hashIndex]]);
			// ES6 has sets but no proper set operations ~.~
			for (let i=0; i < oldHashes.length; i++) {
				if (!newHashes.has(oldHashes[i])) {
					changes.removed[oldHashes[i]] = this.torrents[oldHashes[i]];
					delete this.torrents[oldHashes[i]];
				}
			}
		}

		// Tell the world
		this.emit('change', changes);
	}
}

module.exports = new TorrentStore();
