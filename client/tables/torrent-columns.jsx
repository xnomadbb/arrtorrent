const React = require('react/addons');
const ProgressBar = require('../progress-bar');
const util = require('../util');

//TODO Figure out if we can omit downloading some columns/data from rtorrent

// key: CSS/HTML/etc-safe internal id of column
// name: Name to display in column header
// tooltip: Text to display on column header hover
// getSortKey: sortKey function(rowData), return a sortable value for the cell
// renderCellContents: content function(rowData), return the contents of the cell

module.exports = [
	{
		key: 'name',
		name: 'Name',
		tooltip: 'Name of torrent.',
		getSortKey: row => { return row.name; },
		renderCellContents: row => { return row.name; },
	},
	{
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
	},
	{
		key: 'size',
		name: 'Size',
		tooltip: 'Total size of torrent content in IEC (binary) units.',
		getSortKey: row => { return row.size_bytes; },
		renderCellContents: row => { return util.format.bytesToHtml(row.size_bytes, true); },
	},
	{
		key: 'progress',
		name: 'Progress',
		tooltip: 'Percentage of torrent content snatched.',
		getSortKey: row => { return row.bytes_done / row.size_bytes; },
		renderCellContents: row => {
			let completed = row.bytes_done / row.size_bytes * 100;
			return <ProgressBar completed={completed} />;
		},
	},
	{
		key: 'download_size',
		name: 'Downloaded',
		tooltip: 'Size of torrent content snatched in IEC (binary) units. Not the total traffic leeched.',
		getSortKey: row => { return row.bytes_done; },
		renderCellContents: row => { return util.format.bytesToHtml(row.bytes_done, true); },
	},
	{
		key: 'upload_size',
		name: 'Uploaded',
		tooltip: 'Total torrent traffic seeded in IEC (binary) units.',
		getSortKey: row => { return row.bytes_done; },
		renderCellContents: row => { return util.format.bytesToHtml(row.bytes_done, true); },
	},
	{
		key: 'download_rate',
		name: 'DL',
		tooltip: 'Current traffic rate of leeching in IEC (binary) units.',
		getSortKey: row => { return row.down_rate; },
		renderCellContents: row => { return util.format.bytesPerSecondToHtml(row.down_rate, false); },
	},
	{
		key: 'upload_rate',
		name: 'UL',
		tooltip: 'Current traffic rate of seeding in IEC (binary) units.',
		getSortKey: row => { return row.up_rate; },
		renderCellContents: row => { return util.format.bytesPerSecondToHtml(row.up_rate, false); },
	},
	{
		key: 'ratio',
		name: 'Ratio',
		tooltip: 'Ratio of traffic uploaded/downloaded.',
		getSortKey: row => { return row.ratio; },
		renderCellContents: row => { return row.ratio; }, //TODO formatting
	},
	{
		key: 'eta',
		name: 'ETA',
		tooltip: 'Estimated time until all content downloaded.',
		getSortKey: row => { return row.left_bytes / row.down_rate || 0; },
		renderCellContents: row => {
			let remaining = row.left_bytes / row.down_rate || 0;
			return util.format.secondsToHtml(remaining, false, 3);
		},
	},
	{
		key: 'label',
		name: 'Label',
		tooltip: 'Label assigned to torrent for manual categorization.',
		getSortKey: row => { return row.label; },
		renderCellContents: row => { return row.label; },
	},
	{
		key: 'peers',
		name: 'Peers',
		tooltip: 'Number of peers connected (Total number of peers in swarm)',
		getSortKey: row => { return row.peers_accounted; },
		renderCellContents: row => {
			let totalPeers = 0;
			for (let i=0; i < row.trackers.length; i++) {
				totalPeers += (parseInt(row.trackers[i].scrape_incomplete, 10) || 0);
			}
			return `${row.peers_accounted} (${totalPeers})`; //TODO html formatting
		},
	},
	{
		key: 'seeds',
		name: 'Seeds',
		tooltip: 'Number of seeds connected (Total number of seeds in swarm)',
		getSortKey: row => { return row.peers_complete; },
		renderCellContents: row => {
			let totalSeeds = 0;
			for (let i=0; i < row.trackers.length; i++) {
				totalSeeds += (parseInt(row.trackers[i].scrape_complete, 10) || 0);
			}
			return `${row.peers_complete} (${totalSeeds})`; //TODO html formatting
		},
	},
	{
		key: 'priority',
		name: 'Priority',
		tooltip: 'Priority of the torrent.', //FIXME this explanation sucks
		getSortKey: row => { return row.priority; },
		renderCellContents: row => { return row.priority_string; },
	},
	{
		key: 'remaining',
		name: 'Remaining',
		tooltip: 'Size of torrent content remaining to be snatched in IEC (binary) units.',
		getSortKey: row => { return row.left_bytes; },
		renderCellContents: row => { return util.format.bytesToHtml(row.left_bytes, true); },
	},
	{
		key: 'created',
		name: 'Created On',
		tooltip: 'Date and time at which torrent file was created.',
		getSortKey: row => { return row.creation_date; },
		renderCellContents: row => { return row.creation_date; }, //TODO formatting
	},
	//TODO Finished and Added backend: https://github.com/Novik/ruTorrent/blob/master/plugins/seedingtime/init.php
	//     compatibility with rutorrent is very important here, we need to (maybe conditionally)
	//     add an method to update this in a compatible way.
	{
		key: 'added',
		name: 'Added On',
		tooltip: 'Date and time at which torrent was added to rtorrent.',
		getSortKey: row => { return row.add_date; },
		renderCellContents: row => { return row.add_date; }, //TODO formatting
	},
	{
		key: 'finished',
		name: 'Finished On',
		tooltip: 'Date and time at which torrent contents finished downloading.',
		getSortKey: row => { return row.finish_date; },
		renderCellContents: row => { return row.finish_date; }, //TODO formatting
	},
	//TODO ratio groups: https://github.com/Novik/ruTorrent/tree/master/plugins/ratio
	//     This uses actual views, so compat seems reasonable here too

	//TODO ratio per day/week/month: https://github.com/Novik/ruTorrent/tree/master/plugins/trafic
	//     This uses files on disk for stats, might be a pain (can we do stats better?)
	{
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
	},
];
