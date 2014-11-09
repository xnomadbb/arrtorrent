module.exports = {
	port: 8080, // Port for arrtorrent to listen on, must be >1024 unless running as root (don't)

	// Settings for rtorrent connectivity
	rtorrent: {
		socket: '/tmp/rtorrent.sock.fake', // Path to rtorrent.rc's scgi_local
		eventSocket: '/tmp/arrtorrent_events.sock', // Arbitrary path to event socket, will be created on startup
	},

	auth: {
		users: [
			{username: 'user', password: '$2a$10$ZylnSq/PjolpiND1BEXKVepi.dE01kfQzVp8JubZ/WbdFUyxRVLdi'}, // password: hackme // Jfd80dFgfds08FDSNVds8fds79
		]
	},

};
