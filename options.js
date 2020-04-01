// Written by Mike Frysinger <vapier@gmail.com>.  Released into the public domain.

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
		// Can't leave this blank or Chrome will resize the options page.
		msg.innerHTML = '&nbsp;';
	}, 5000);
}

function keydown(e) {
	if (e.key == 'Enter') {
		update_settings();
	}
}

function toggle_visible_pass() {
	const ele = document.getElementById('pass');
	ele.type = (ele.type == 'password') ? 'text' : 'password';
	// Disable form submission.
	return false;
}

window.onload = function() {
	storage.get(settings_keys, function(settings) {
		var field = document.getElementById('save');
		field.onclick = update_settings;

		settings_keys.forEach(function(key) {
			var field = document.getElementById(key);
			field.value = settings[key] || settings_defaults[key];
			field.onkeydown = keydown;
		});
	});
	document.getElementById('show-pass').onclick = toggle_visible_pass;
};
