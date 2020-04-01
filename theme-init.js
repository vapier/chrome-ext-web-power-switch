// Written by Mike Frysinger <vapier@gmail.com>.  Released into the public domain.

// Load the theme override asap to help with initial loading/flashing.
chrome.storage.sync.get(['theme'], ({theme}) => {
	if (theme == 'light' || theme == 'dark') {
		const css = document.querySelector('link#theme-override');
		css.href = `css/${theme}.css`;
	}
});
