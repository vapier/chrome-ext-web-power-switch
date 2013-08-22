// Written by Mike Frysinger <vapier@gmail.com>.  Released into the public domain.  Suck it.

function update_settings() {
	var url = document.getElementById('url').value + '/*';
	var msg = document.getElementById('msg');

	console.log('requesting access to', url);
	chrome.permissions.request({
		origins: [url]
	}, function(granted) {
		if (granted) {
			msg.innerText = 'Saved!';

			// Sync all of the settings to storage first.
			var settings = {}
			settings_keys.forEach(function(key) {
				var field = document.getElementById(key);
				settings[field.id] = field.value;
			});
			storage.set(settings);

			// Then revoke existing perms that the user gave us.
			chrome.permissions.getAll(function(perms) {
				perms.origins.forEach(function(key) {
					if (key == url)
						return;

					console.log('revoking access to', key);
					chrome.permissions.remove({
						origins: [key],
					});
				});
			});
		} else {
			msg.innerText = 'You must grant permission in order to save!';
		}
	});

	msg.timeout = setTimeout(function() {
		msg.innerText = '';
	}, 5000);
}

window.onload = function() {
	storage.get(settings_keys, function(settings) {
		var field = document.getElementById('save');
		field.onclick = update_settings;

		settings_keys.forEach(function(key) {
			var field = document.getElementById(key);
			field.value = settings[key] || settings_defaults[key];
		});
	});
};
