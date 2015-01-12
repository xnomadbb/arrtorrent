const url = require('url');
const sha1 = require('sha1');

const util = {
	torrent: {
		commands: {
			// Categorized dict of {category: [...d.commands]}
			// categories are as labeled
			// d.command are data commands for rtorrent with no trailing =
			immutable: [ // Should never change
				'd.get_hash',
				'd.get_base_filename',
				'd.get_chunk_size',
				'd.get_creation_date',
				'd.get_message',
				'd.get_name',
				'd.get_size_bytes',
				'd.get_size_chunks',
				'd.get_size_files',
				'd.is_private',
			],
			dynamic: [ // Frequently changing during normal execution
				'd.get_up_rate',
				'd.get_up_total',
				'd.get_down_rate',
				'd.get_down_total',
				'd.get_ratio',

				'd.get_bitfield',
				'd.get_bytes_done',
				'd.get_complete',
				'd.get_completed_bytes',
				'd.get_completed_chunks',
				'd.get_left_bytes',

				'd.is_active',
				'd.is_hash_checked',
				'd.is_hash_checking',
				'd.is_multi_file',
				'd.is_open',

				'd.get_hashing',
				'd.get_hashing_failed',
				'd.get_chunks_hashed',

				'd.get_connection_current',
				'd.get_connection_leech',
				'd.get_connection_seed',

				'd.get_peers_accounted',
				'd.get_peers_complete',
				'd.get_peers_connected',
				'd.get_peers_not_connected',

				't.multicall=,t.get_url=',
			],
			mutable: [ // Normally static but can be changed by infrequent actions
				// Options, mutable via user input
				'd.get_custom1',
				'd.get_custom2',
				'd.get_custom3',
				'd.get_custom4',
				'd.get_custom5',
				'd.is_pex_active',
				'd.get_priority',
				'd.get_priority_str',
				'd.get_peers_max',
				'd.get_peers_min',
				'd.get_uploads_max',
				'd.get_peer_exchange',
				'd.get_max_file_size',
				// Paths on disk, mutable via moving files, etc
				'd.get_base_path',
				'd.get_directory',
				'd.get_directory_base',
				'd.get_loaded_file',
				'd.get_tied_to_file',
			],
		},
		commandToField: {
			// Dict of {d.command: fieldName}
			// fieldName must be everything-safe (identifier, CSS, URL, etc, generally [a-zA-Z][a-zA-Z0-9_]*)
			// fieldName is used to arrange torrent data, eg. torrents[hash].chunk_size
			'd.get_hash': 'hash',
			'd.get_base_filename': 'base_filename',
			'd.get_chunk_size': 'chunk_size',
			'd.get_creation_date': 'creation_date',
			'd.get_message': 'message',
			'd.get_name': 'name',
			'd.get_size_bytes': 'size_bytes',
			'd.get_size_chunks': 'size_chunks',
			'd.get_size_files': 'size_files',
			'd.is_private': 'is_private',
			'd.get_up_rate': 'up_rate',
			'd.get_up_total': 'up_total',
			'd.get_down_rate': 'down_rate',
			'd.get_down_total': 'down_total',
			'd.get_ratio': 'ratio',
			'd.get_bitfield': 'bitfield',
			'd.get_bytes_done': 'bytes_done',
			'd.get_complete': 'is_complete',
			'd.get_completed_bytes': 'completed_bytes',
			'd.get_completed_chunks': 'completed_chunks',
			'd.get_left_bytes': 'left_bytes',
			'd.is_active': 'is_active',
			'd.is_hash_checked': 'is_hash_checked',
			'd.is_hash_checking': 'is_hash_checking',
			'd.is_multi_file': 'is_multi_file',
			'd.is_open': 'is_open',
			'd.get_hashing': 'is_hashing',
			'd.get_hashing_failed': 'is_hashing_failed',
			'd.get_chunks_hashed': 'chunks_hashed',
			'd.get_connection_current': 'connection_current',
			'd.get_connection_leech': 'connection_leech',
			'd.get_connection_seed': 'connection_seed',
			'd.get_peers_accounted': 'peers_accounted',
			'd.get_peers_complete': 'peers_complete',
			'd.get_peers_connected': 'peers_connected',
			'd.get_peers_not_connected': 'peers_not_connected',
			'd.get_custom1': 'label', // rutorrent-compatible
			'd.get_custom2': 'custom2',
			'd.get_custom3': 'custom3',
			'd.get_custom4': 'custom4',
			'd.get_custom5': 'custom5',
			'd.is_pex_active': 'is_pex_active',
			'd.get_priority': 'priority',
			'd.get_priority_str': 'priority_string',
			'd.get_peers_max': 'peers_max',
			'd.get_peers_min': 'peers_min',
			'd.get_uploads_max': 'uploads_max',
			'd.get_peer_exchange': 'is_pex_enabled', //XXX
			'd.get_max_file_size': 'max_file_size',
			'd.get_base_path': 'base_path',
			'd.get_directory': 'directory',
			'd.get_directory_base': 'directory_base',
			'd.get_loaded_file': 'torrent_file_session',
			'd.get_tied_to_file': 'torrent_file_watch',

			't.multicall=,t.get_url=': 'trackers',
		},
		complexFieldDeserializers: {
			'trackers': rawResponse => {
				return rawResponse.map(rawTracker => {
					return {
						'url': rawTracker[0],
						//'url': rawTracker[1],
					};
				});
			},
		},
	},
	tracker: {
		identifiers: {
			// alias: sha1(domain)
			'ab': '8ce0ca19cc0791e13565b6944fa1e96d1cdd050e',
			'bib': '77086adc5e0099593036cc6b3e68a62a1fcc7b36',
			'btn': '504acdd183fa55c53727dc2e14c6c5ab92b1f908',
			'btn_tracker_alt': 'd02eea1e0fec17017b36b43e0c38f701c07315f4',
			'ggn': '3b9fa6054c7fafccf42e9b7c9cc1e229725c7e7b',
			'ptp': '404021fe4c0f72574716d215c4c1f745e6e92220',
			'ptp_tracker': '7cfaf434e2285fc21d59a9c6021c1a48ec8cdbe5',
			'scc': 'ecccbc83fa602195676a05c400af7395c2ad51da',
			'scc_tracker': '032c4669bddcbe997886eece95b1e1d7b0706e44',
			'stp': '5f816fa403cdd8fc20ebe15c7c14c2b4d91b08b0',
			'wcd': '057187c66532a5bf6c8b54ced70666ebce32875f',
			'wfl': '4c1a70add824a8642e527fd95066666b6304e547',
		},
		urlToDomain: inUrl => {
			let trackerHost = url.parse(inUrl).hostname;
			trackerHost = trackerHost.replace(/^tracker\./i, ''); // Remove any leading "tracker."

			let trackerHash = sha1(trackerHost);
			if (trackerHash === util.tracker.identifiers.ptp_tracker) {
				trackerHost = trackerHost.split('.').splice(1).join('.') // Chop witty subdomain
			}

			return trackerHost;
		},
	},
};
module.exports = util;
