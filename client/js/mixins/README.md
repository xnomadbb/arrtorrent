Contains React mixins.

- `context-menu.jsx`
Provides an easy way to spawn custom context menus on anything.
Just pass a `getContextMenuOptions()` prop to the component which
returns a list of menu options as described in `../components/README.md`

- `flex-resizer.jsx`
Provides an easy-ish way to resize flexbox panes.
Add a `flexResizerTarget` ref to the pane which should be resized.
Add a resizing handle with the `flexResizerRenderHandle` method, specifying the axis and direction in which the resize should operate.
The `flex-basis` of the target will be modified and a `PaneResize` event will be emitted upon resize.
See the main or root panes in `../panes` for examples, which might make more sense than this explanation.

