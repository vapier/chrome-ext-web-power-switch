// Written by Mike Frysinger <vapier@gmail.com>.  Released into the public domain.

function $(s) { return document.querySelector(s); }

var storage = chrome.storage.sync;

var settings_keys = [
	'url',
	'user',
	'pass',
	'theme',
];

var settings_defaults = {
	'url': 'http://192.168.0.100',
	'user': 'admin',
	'pass': '1234',
	'theme': 'system',
};
