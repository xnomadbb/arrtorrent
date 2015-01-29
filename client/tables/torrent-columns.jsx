var React = require('react/addons');
var ProgressBar = require('../progress-bar');
var util = require('../util');

//TODO Figure out if we can omit downloading some columns/data from rtorrent

// object property: must be identical to key
// key: CSS/HTML/etc-safe lowercase internal id of column
// name: Name to display in column header
// tooltip: Text to display on column header hover
// getSortKey: sortKey function(rowData), return a sortable value for the cell
// renderCellContents: content function(rowData), return the contents of the cell
// align: left or right, applies align_left or align_right class to cells/headers

var columns = {
	'name': {
		key: 'name',
		name: 'Name',
		tooltip: 'Name of torrent.',
		getSortKey: function(row) { return row.name.toLowerCase(); },
		renderCellContents: function(row) { return row.name; },
		align: 'left',
	},
	'status': {
		key: 'status',
		name: 'Status',
		tooltip: 'Current status of torrent.',
		getSortKey: function(row) {
			var status_error = util.torrent.getStatusFromTorrent(row);
			return (status_error[1] ? '1_' : '0_') + status_error[0];
		},
		renderCellContents: function(row) {
			var status_error = util.torrent.getStatusFromTorrent(row);
			var statusName = util.torrent.statusNames[status_error[0]];

			var classes = {};
			classes.error = status_error[1];
			classes['status_' + status_error[0]] = true;
			classes = React.addons.classSet(classes);

			return (<span className={classes}>{statusName}</span>);
		},
		align: 'left',
	},
	'size': {
		key: 'size',
		name: 'Size',
		tooltip: 'Total size of torrent content.',
		getSortKey: function(row) { return parseInt(row.size_bytes, 10); },
		renderCellContents: function(row) { return util.format.bytesToHtml(row.size_bytes, true); },
		align: 'right',
	},
	'progress': {
		key: 'progress',
		name: 'Progress',
		tooltip: 'Percentage of torrent content snatched.',
		getSortKey: function(row) { return row.bytes_done / row.size_bytes; },
		renderCellContents: function(row) {
			var completed = row.bytes_done / row.size_bytes * 100;
			return <ProgressBar completed={completed} />;
		},
		align: 'left',
	},
	'upload_size': {
		key: 'upload_size',
		name: 'Uploaded',
		tooltip: 'Total torrent traffic seeded.',
		getSortKey: function(row) { return parseInt(row.up_total, 10); },
		renderCellContents: function(row) { return util.format.bytesToHtml(row.up_total, true); },
		align: 'right',
	},
	'download_size': {
		key: 'download_size',
		name: 'Downloaded',
		tooltip: 'Size of torrent content snatched. Not the total traffic leeched.',
		getSortKey: function(row) { return parseInt(row.bytes_done, 10); },
		renderCellContents: function(row) { return util.format.bytesToHtml(row.bytes_done, true); },
		align: 'right',
	},
	'upload_rate': {
		key: 'upload_rate',
		name: 'UL',
		tooltip: 'Current traffic rate of seeding.',
		getSortKey: function(row) { return parseInt(row.up_rate, 10); },
		renderCellContents: function(row) { return util.format.bytesPerSecondToHtml(row.up_rate, false); },
		align: 'right',
	},
	'download_rate': {
		key: 'download_rate',
		name: 'DL',
		tooltip: 'Current traffic rate of leeching.',
		getSortKey: function(row) { return parseInt(row.down_rate, 10); },
		renderCellContents: function(row) { return util.format.bytesPerSecondToHtml(row.down_rate, false); },
		align: 'right',
	},
	'ratio': {
		key: 'ratio',
		name: 'Ratio',
		tooltip: 'Ratio of traffic uploaded/downloaded.',
		getSortKey: function(row) { return parseInt(row.ratio, 10); },
		renderCellContents: function(row) { return util.format.ratioToHtml(row.ratio, true); },
		align: 'right',
	},
	'eta': {
		key: 'eta',
		name: 'ETA',
		tooltip: 'Estimated time until all content downloaded.',
		getSortKey: function(row) { return row.left_bytes / row.down_rate || 0; },
		renderCellContents: function(row) {
			var remaining = row.left_bytes / row.down_rate || 0;
			return util.format.secondsToHtml(remaining, false, 3);
		},
		align: 'left',
	},
	'label': {
		key: 'label',
		name: 'Label',
		tooltip: 'Label assigned to torrent for manual categorization.',
		getSortKey: function(row) { return row.label; },
		renderCellContents: function(row) { return row.label; },
		align: 'left',
	},
	'peers': {
		key: 'peers',
		name: 'Peers',
		tooltip: 'Number of peers connected (Total number of peers in swarm)',
		getSortKey: function(row) { return parseInt(row.peers_accounted, 10); },
		renderCellContents: function(row) {
			var totalPeers = 0;
			for (var i=0; i < row.trackers.length; i++) {
				totalPeers += (parseInt(row.trackers[i].scrape_incomplete, 10) || 0);
			}
			return (
				<div>
					<span className="connected">{row.peers_accounted}</span>
					<span className="total">{totalPeers}</span>
				</div>
			);
		},
		align: 'right',
	},
	'seeds': {
		key: 'seeds',
		name: 'Seeds',
		tooltip: 'Number of seeds connected (Total number of seeds in swarm)',
		getSortKey: function(row) { return parseInt(row.peers_complete, 10); },
		renderCellContents: function(row) {
			var totalSeeds = 0;
			for (var i=0; i < row.trackers.length; i++) {
				totalSeeds += (parseInt(row.trackers[i].scrape_complete, 10) || 0);
			}
			return (
				<div>
					<span className="connected">{row.peers_complete}</span>
					<span className="total">{totalSeeds}</span>
				</div>
			);
		},
		align: 'right',
	},
	'priority': {
		key: 'priority',
		name: 'Priority',
		tooltip: 'Priority of the torrent.',
		getSortKey: function(row) { return parseInt(row.priority, 10); },
		renderCellContents: function(row) { return row.priority_string; },
		align: 'left',
	},
	'remaining': {
		key: 'remaining',
		name: 'Remaining',
		tooltip: 'Size of torrent content remaining to be snatched.',
		getSortKey: function(row) { return parseInt(row.left_bytes); },
		renderCellContents: function(row) { return util.format.bytesToHtml(row.left_bytes, true); },
		align: 'right',
	},
	'created': {
		key: 'created',
		name: 'Created On',
		tooltip: 'Date and time at which torrent file was created.',
		getSortKey: function(row) { return parseInt(row.creation_date, 10); },
		renderCellContents: function(row) { return util.format.unixTimeToHtmlDate(row.creation_date, false); },
		align: 'right',
	},
	//TODO Finished and Added backend: https://github.com/Novik/ruTorrent/blob/master/plugins/seedingtime/init.php
	//     compatibility with rutorrent is very important here, we need to (maybe conditionally)
	//     add an method to update this in a compatible way.
	'added': {
		key: 'added',
		name: 'Added On',
		tooltip: 'Date and time at which torrent was added to rtorrent.',
		getSortKey: function(row) { return parseInt(row.add_date, 10); },
		renderCellContents: function(row) { return util.format.unixTimeToHtmlDate(row.add_date, false); },
		align: 'right',
	},
	'finished': {
		key: 'finished',
		name: 'Finished On',
		tooltip: 'Date and time at which torrent contents finished downloading.',
		getSortKey: function(row) { return parseInt(row.finish_date, 10); },
		renderCellContents: function(row) { return util.format.unixTimeToHtmlDate(row.finish_date, false); },
		align: 'right',
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
		getSortKey: function(row) {
			var url = row.trackers[row.tracker_focus - 1].url;
			return util.tracker.urlToDomain(url);
		},
		renderCellContents: function(row) {
			var url = row.trackers[row.tracker_focus - 1].url;
			return util.tracker.urlToDomain(url);
		},
		align: 'left',
	},
};

// List of column keys
var initialOrder = [
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
