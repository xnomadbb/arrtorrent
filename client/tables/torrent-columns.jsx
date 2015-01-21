const React = require('react/addons');
const ProgressBar = require('../progress-bar');
const util = require('../util');

//TODO Figure out if we can omit downloading some columns/data from rtorrent

// object property: must be identical to key
// key: CSS/HTML/etc-safe lowercase internal id of column
// name: Name to display in column header
// tooltip: Text to display on column header hover
// getSortKey: sortKey function(rowData), return a sortable value for the cell
// renderCellContents: content function(rowData), return the contents of the cell
// shouldCellUpdate: bool function(oldRowData, newRowData)

let returnTrue  = function() { return  true; }; // To always update
let returnFalse = function() { return false; }; // To never update (except initial render)

const columns = {
	'name': {
		key: 'name',
		name: 'Name',
		tooltip: 'Name of torrent.',
		getSortKey: row => { return row.name; },
		renderCellContents: row => { return row.name; },
		shouldCellUpdate: returnFalse,
	},
	'status': {
		key: 'status',
		name: 'Status',
		tooltip: 'Current status of torrent.',
		getSortKey: row => {
			let [status, error] = util.torrent.getStatusFromTorrent(row);
			return (error ? '1_' : '0_') + status;
		},
		renderCellContents: row => {
			let [status, error] = util.torrent.getStatusFromTorrent(row);
			let statusName = util.torrent.statusNames[status];

			let classes = {};
			classes.error = error;
			classes['status_' + status] = true;
			classes = React.addons.classSet(classes);

			return (<span className={classes}>{statusName}</span>);
		},
		shouldCellUpdate: returnTrue,
	},
	'size': {
		key: 'size',
		name: 'Size',
		tooltip: 'Total size of torrent content.',
		getSortKey: row => { return row.size_bytes; },
		renderCellContents: row => { return util.format.bytesToHtml(row.size_bytes, true); },
		shouldCellUpdate: returnFalse,
	},
	'progress': {
		key: 'progress',
		name: 'Progress',
		tooltip: 'Percentage of torrent content snatched.',
		getSortKey: row => { return row.bytes_done / row.size_bytes; },
		renderCellContents: row => {
			let completed = row.bytes_done / row.size_bytes * 100;
			return <ProgressBar completed={completed} />;
		},
		shouldCellUpdate: (old, next) => { return old.bytes_done != next.bytes_done; },
	},
	'upload_size': {
		key: 'upload_size',
		name: 'Uploaded',
		tooltip: 'Total torrent traffic seeded.',
		getSortKey: row => { return row.up_total; },
		renderCellContents: row => { return util.format.bytesToHtml(row.up_total, true); },
		shouldCellUpdate: (old, next) => { return old.up_total !== next.up_total; },
	},
	'download_size': {
		key: 'download_size',
		name: 'Downloaded',
		tooltip: 'Size of torrent content snatched. Not the total traffic leeched.',
		getSortKey: row => { return row.bytes_done; },
		renderCellContents: row => { return util.format.bytesToHtml(row.bytes_done, true); },
		shouldCellUpdate: (old, next) => { return old.bytes_done !== next.bytes_done; },
	},
	'upload_rate': {
		key: 'upload_rate',
		name: 'UL',
		tooltip: 'Current traffic rate of seeding.',
		getSortKey: row => { return row.up_rate; },
		renderCellContents: row => { return util.format.bytesPerSecondToHtml(row.up_rate, false); },
		shouldCellUpdate: (old, next) => { return old.up_rate !== next.up_rate; },
	},
	'download_rate': {
		key: 'download_rate',
		name: 'DL',
		tooltip: 'Current traffic rate of leeching.',
		getSortKey: row => { return row.down_rate; },
		renderCellContents: row => { return util.format.bytesPerSecondToHtml(row.down_rate, false); },
		shouldCellUpdate: (old, next) => { return old.down_rate !== next.down_rate; },
	},
	'ratio': {
		key: 'ratio',
		name: 'Ratio',
		tooltip: 'Ratio of traffic uploaded/downloaded.',
		getSortKey: row => { return row.ratio; },
		renderCellContents: row => { return util.format.ratioToHtml(row.ratio, true); },
		shouldCellUpdate: (old, next) => { return old.ratio !== next.ratio; },
	},
	'eta': {
		key: 'eta',
		name: 'ETA',
		tooltip: 'Estimated time until all content downloaded.',
		getSortKey: row => { return row.left_bytes / row.down_rate || 0; },
		renderCellContents: row => {
			let remaining = row.left_bytes / row.down_rate || 0;
			return util.format.secondsToHtml(remaining, false, 3);
		},
		shouldCellUpdate: (old, next) => { return (old.left_bytes !== next.left_bytes) || (old.down_rate !== next.down_rate) ; },
	},
	'label': {
		key: 'label',
		name: 'Label',
		tooltip: 'Label assigned to torrent for manual categorization.',
		getSortKey: row => { return row.label; },
		renderCellContents: row => { return row.label; },
		shouldCellUpdate: (old, next) => { return old.label !== next.label; },
	},
	'peers': {
		key: 'peers',
		name: 'Peers',
		tooltip: 'Number of peers connected (Total number of peers in swarm)',
		getSortKey: row => { return row.peers_accounted; },
		renderCellContents: row => {
			let totalPeers = 0;
			for (let i=0; i < row.trackers.length; i++) {
				totalPeers += (parseInt(row.trackers[i].scrape_incomplete, 10) || 0);
			}
			return (
				<div>
					<span className="connected">{row.peers_accounted}</span>
					<span className="total">{totalPeers}</span>
				</div>
			);
		},
		shouldCellUpdate: (old, next) => { return JSON.stringify(old.trackers) !== JSON.stringify(next.trackers); },
	},
	'seeds': {
		key: 'seeds',
		name: 'Seeds',
		tooltip: 'Number of seeds connected (Total number of seeds in swarm)',
		getSortKey: row => { return row.peers_complete; },
		renderCellContents: row => {
			let totalSeeds = 0;
			for (let i=0; i < row.trackers.length; i++) {
				totalSeeds += (parseInt(row.trackers[i].scrape_complete, 10) || 0);
			}
			return (
				<div>
					<span className="connected">{row.peers_complete}</span>
					<span className="total">{totalSeeds}</span>
				</div>
			);
		},
		shouldCellUpdate: (old, next) => { return JSON.stringify(old.trackers) !== JSON.stringify(next.trackers); },
	},
	'priority': {
		key: 'priority',
		name: 'Priority',
		tooltip: 'Priority of the torrent.',
		getSortKey: row => { return row.priority; },
		renderCellContents: row => { return row.priority_string; },
		shouldCellUpdate: (old, next) => { return old.priority !== next.priority; },
	},
	'remaining': {
		key: 'remaining',
		name: 'Remaining',
		tooltip: 'Size of torrent content remaining to be snatched.',
		getSortKey: row => { return row.left_bytes; },
		renderCellContents: row => { return util.format.bytesToHtml(row.left_bytes, true); },
		shouldCellUpdate: (old, next) => { return old.left_bytes !== next.left_bytes; },
	},
	'created': {
		key: 'created',
		name: 'Created On',
		tooltip: 'Date and time at which torrent file was created.',
		getSortKey: row => { return row.creation_date; },
		renderCellContents: row => { return util.format.unixTimeToHtml(row.creation_date, false); },
		shouldCellUpdate: returnFalse,
	},
	//TODO Finished and Added backend: https://github.com/Novik/ruTorrent/blob/master/plugins/seedingtime/init.php
	//     compatibility with rutorrent is very important here, we need to (maybe conditionally)
	//     add an method to update this in a compatible way.
	'added': {
		key: 'added',
		name: 'Added On',
		tooltip: 'Date and time at which torrent was added to rtorrent.',
		getSortKey: row => { return row.add_date; },
		renderCellContents: row => { return util.format.unixTimeToHtml(row.add_date, false); },
		shouldCellUpdate: (old, next) => { return old.add_date !== next.add_date; },
	},
	'finished': {
		key: 'finished',
		name: 'Finished On',
		tooltip: 'Date and time at which torrent contents finished downloading.',
		getSortKey: row => { return row.finish_date; },
		renderCellContents: row => { return util.format.unixTimeToHtml(row.finish_date, false); },
		shouldCellUpdate: (old, next) => { return old.finish_date !== next.finish_date; },
	},
	//TODO ratio groups: https://github.com/Novik/ruTorrent/tree/master/plugins/ratio
	//     This uses actual views, so compat seems reasonable here too

	//TODO ratio per day/week/month: https://github.com/Novik/ruTorrent/tree/master/plugins/trafic
	//     This uses files on disk for stats, might be a pain (can we do stats better?)
	'tracker': {
		//FIXME make sure tracker_focus is always set and never overruns trackers array
		key: 'tracker',
		name: 'Tracker',
		tooltip: "Domain of the focused tracker for this torrent. (Don't ask how to focus a tracker.)", //FIXME cocks
		getSortKey: row => {
			let url = row.trackers[row.tracker_focus - 1].url;
			return util.tracker.urlToDomain(url);
		},
		renderCellContents: row => {
			let url = row.trackers[row.tracker_focus - 1].url;
			return util.tracker.urlToDomain(url);
		},
		shouldCellUpdate: (old, next) => { return JSON.stringify(old.trackers) !== JSON.stringify(next.trackers); },
	},
};

// List of column keys
const initialOrder = [
	'name',
	'status',
	'size',
	'progress',
	'upload_size',
	'download_size',
	'upload_rate',
	'download_rate',
	'ratio',
	'eta',
	'label',
	'peers',
	'seeds',
	'priority',
	'remaining',
	'created',
	'added',
	'finished',
	'tracker',
];

module.exports = {columns: columns, initialOrder: initialOrder};
