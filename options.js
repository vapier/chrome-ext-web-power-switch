// Written by Mike Frysinger <vapier@gmail.com>.  Released into the public domain.  Suck it.

function update_settings() {
	var setting = {};
	setting[this.id] = this.value;
	storage.set(setting);
}

window.onload = function() {
	storage.get(settings_keys, function(settings) {
		settings_keys.forEach(function(key) {
			var field = document.getElementById(key);
			field.value = settings[key] || settings_defaults[key];
			field.oninput = update_settings;
		});
	});
};
