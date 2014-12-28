const EventEmitter = require('events').EventEmitter;
const ArrRpc = require('./rpc');

class TorrentStore extends EventEmitter {
	constructor() {
		this.viewNames = [];
		this.viewHashes = {};
		if (ArrRpc.config) {
			this.loadInit();
		} else {
			ArrRpc.once('configLoaded', this.loadInit.bind(this));
		}
	}

	loadInit() {
		ArrRpc.sendRequest('view_list', [], response => {
			this.viewNames = response.result;
			this.updateViewHashes(this.viewNames);
		});
	}

	updateViewHashes(viewList) {
		let multicalls = viewList.map(v => ['d.multicall', [v, 'd.get_hash=']]);
		ArrRpc.sendRequest('arr.multicall', multicalls, response => {
			for (let i=0; i < response.result.length; i++) {
				this.viewHashes[viewList[i]] = response.result[i][0];
			}
			console.log(viewList, this.viewHashes);
			this.emit('view.change');
		});
	}

}
window.rpc = ArrRpc;

module.exports = new TorrentStore();
