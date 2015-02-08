Contains large sections of the UI mostly to organize and plumb everything together.

The root pane is the top-most UI element which organizes all of the others.
The main pane is the big area on the right containing the torrent table and details pane.
The login pane is the only one which is not under the root pane, `../main.jsx` toggles between displaying the login and root panes according to auth status.
Everything else should be fairly obvious.

```
 __________________________________________
| RootPane                                 |
|  ______________________________________  |
| | HeaderPane                           | |
|  --------------------------------------  |
|  ______________________________________  |
| | CenterPane (part of root file)       | |
| |  _____________   __________________  | |
| | | SidebarPane | | MainPane         | | |
| | |             | |  ______________  | | |
| | |             | | | TorrentTable | | | |
| | |             | |  --------------  | | |
| | |             | |  ______________  | | |
| | |             | | | DetailsPane  | | | |
| | |             | |  --------------  | | |
| |  -------------   ------------------  | |
|  --------------------------------------  |
|  ______________________________________  |
| | FooterPane                           | |
|  --------------------------------------  |
 ------------------------------------------
```

