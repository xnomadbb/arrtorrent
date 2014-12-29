const EventEmitter = require('events').EventEmitter;
const ArrRpc = require('./rpc');

class TorrentStore extends EventEmitter {
	constructor() {
		this.viewIds = [];
		this.viewNames = {};
		this.viewHashes = {};

		this.builtinViewIds = ['main', 'default', 'name', 'active', 'started', 'stopped', 'complete', 'incomplete', 'hashing', 'seeding', 'leeching'];
		this.blacklistViewIds = [
			// Useless?
			'default', 'name',
			// rutorrent ratio groups (not sure)?
			'rat_0', 'rat_1', 'rat_2', 'rat_3', 'rat_4', 'rat_5', 'rat_6', 'rat_7'
		];

		if (ArrRpc.config) {
			this.loadInit();
		} else {
			ArrRpc.once('configLoaded', this.loadInit.bind(this));
		}
	}

	loadInit() {
		ArrRpc.sendRequest('view_list', [], response => {
			this.viewIds = [];
			// Determine names from ids
			for (let i=0; i < response.result.length; i++) {
				let id = response.result[i];
				if (this.blacklistViewIds.indexOf(id) === -1) {
					this.viewIds.push(id);
					this.viewNames[id] = this.nameFromId(id);
				}
			}
			this.updateViewHashes(this.viewIds);
		});
	}

	updateViewHashes(viewList) {
		let multicalls = viewList.map(v => ['d.multicall', [v, 'd.get_hash=']]);
		ArrRpc.sendRequest('arr.multicall', multicalls, response => {
			// Associate infohash list with each view
			for (let i=0; i < response.result.length; i++) {
				this.viewHashes[viewList[i]] = response.result[i].map(r => r[0]) || [];
			}
			console.log(viewList, this.viewHashes);
			this.emit('view.change');
		});
	}

	nameFromId(viewId) {
		// Just capitalize builtin names
		if (this.builtinViewIds.indexOf(viewId) !== -1) {
			return viewId[0].toUpperCase() + viewId.slice(1);
		}

		//TODO Parse ids for fancy arr-defined views (per-tracker, label, etc)
		return 'TODO Non-builtin view id specified';
	}
}

module.exports = new TorrentStore();
