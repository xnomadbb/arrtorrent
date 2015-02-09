Contains mostly standalone and reusable components that we can build other stuff with.

- `base-table.jsx`
We can interact with this to display rich tables with fancy features. Check out the torrent table for the most complicated usage of this.
	
	Usage: Read the source.
	```jsx
	<BaseTable tableKey="anything" columnDescriptions={Object} initialColumnOrder={Array}
	initialSort={['anyColumnKey', 'ASC']} rowData={Object}
	updateVisibleRowKeys={Function} getContextMenuOptions={Function} />
	```

- `context-menu-manager.jsx`
This sits at the root of the application and displays custom context menus when requested via event.
	
	Usage:
	```jsx
	Event.emit('ContextMenuManager.requestMenu', menuOptions, [clientX, clientY]);
	var menuOptions = [
		{
			key: 'key1',
			name: 'Option Name',
			enabled: true, // True by default
			handleClick: function() {}
		}, {
			type: 'separator' // 'normal' by default, other options not needed for separators
		}, {
			key: 'key2',
			type: 'submenu',
			name: 'Nested Name',
			menuOptions: [] // recursive, same structure as parent array
		}
	];
	```

- `progress-bar.jsx`
Displays a basic progress bar. This can be made to look very nice with CSS, but since things like `width: calc(attr(percentage));` don't work, each percentage needs a rule to match it. You'll notice that the global SCSS coughs out 100 rules to style this, and that's why.
	
	Usage:
	```jsx
	<ProgressBar completed="95" />
	```

- `tab-bar.jsx`
Displays tabs to switch between several content views.
	
	Usage:
	```jsx
	<TabBar initialTab="firstTab">
		<Anything tabName="Clickable Title String" tabKey="firstTab" />
		<div tabName="Another Title" tabKey="secondTab"> Content </div>
	</TabBar>
	```

