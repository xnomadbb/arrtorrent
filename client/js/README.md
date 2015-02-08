All of the client-side JS is here.

`event.jsx`: A dumb EventEmitter singleton to pipe around one-off events that aren't complex enough to warrant stores.
`json-rpc.jsx`: We invented this really nice wheel for handling JSON-RPC server/client stuff. 10% rounder than the leading competitor! This is shared with the server via symlink, so don't do any browser-specific things or change it without looking there too.
`main.jsx`: Entry point of the client-side app, switches from LoginPane to RootPane once authentication happens.
`rpc.jsx`: Handles the websocket connection. This connects to the server over websocket, we speak JSON-RPC over that, then the server either transforms it into XMLRPC and relays it to rtorrent or intercepts the call and does server things (eg. file access).
`util.jsx`: Various utility stuff. Command grouping, status parsing, string parsing, and much more!

`components/`: Reusable components that handle one specific thing.
`details/`: Files concerning the details pane (the tabbed view below the torrent table).
`mixins/`: Ways to cleanly plug common functionality into otherwise unrelated code.
`panes/`: Organizational containers for large UI sections.
`stores/`: Objects to organize complex data and notify when it changes.
`torrent/`: Code to handle all the options/interactions of the main torrent table UI.
