// Written by Mike Frysinger <vapier@gmail.com>.  Released into the public domain.

var storage = chrome.storage.sync;

var settings_keys = [
	'url',
	'user',
	'pass',
];

var settings_defaults = {
	'url': 'http://192.168.0.100',
	'user': 'admin',
	'pass': '1234',
};
