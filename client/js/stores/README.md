Stores contain state for various parts of the app where it doesn't make sense to stick it into components (because it's too complex, too shared, etc).

They're loosely inspired by how Flux goes about things, but no event dispatchers and no forced encapsulation.
Each store is an EventEmitter which has various methods to make things happen and emits events when things change.
Feel free to reach in and read data, but don't mutate anything within.
Method calls are the only things which should mutate this state, and they should always emit an event when they do.

- `log.jsx`
Offers logging for everything.
Levels `debug`, `info`, `warn`, and `error` are for console use, they don't appear during normal usage.
Levels `user_info`, `user_warn`, and `user_error` are displayed to the user in the log pane.
Levels `notify_info`, `notify_warn`, and `notify_error` will attempt to intrusively notify the user depending on configuration.
	
	Usage:
	```jsx
	var log = require('./stores/log').module('DerpModule');
	//  level  eventCode       message                                        more data arguments
	log.warn( 'HerpOverflow', 'The herping has derped beyond critical mass', 'more', 'arguments', 'here')
	```

- `torrent.jsx`
Stores torrent data in one place and provides easy methods to update from rtorrent.

- `view.jsx`
Very hands-off, there's nothing to really use this for other than the sidebar.
It updates views when torrents change and emits changes accordingly.

