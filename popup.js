// Written by Mike Frysinger <vapier@gmail.com>.  Released into the public domain.

var url_base, user, pass;

function fetchpage(url, callback) {
	url = url_base + '/' + url;

	var xhr = new XMLHttpRequest();
	xhr.setstatus = false;
	try {
		xhr.onreadystatechange = function(state) {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					callback(xhr, state);
				} else {
					xhr.setstatus = true;
					setstatus(
						'Could not connect;<br>check your ' +
						'<a id="open-settings" href="">settings</a>'
					);
					document.getElementById('open-settings').onclick = open_settings_page;
					console.log('connect error', state);
				}
			}
		}
		xhr.onerror = function(error) {
			if (!xhr.setstatus)
				setstatus('onerror; see console');
			console.log('xhr error:', error);
		}

		console.log('fetching', url)
		xhr.withCredentials = true;
		xhr.open('GET', url, true, user, pass);
		xhr.responseType = 'document';
		// The user/pass options above don't seem to work, so do it ourselves.
		xhr.setRequestHeader('Authorization', 'Basic ' + btoa(user + ':' + pass));
		xhr.send();
	} catch(e) {
		setstatus('Exception; see console');
		console.log('exception:', e);
	}
}

function onoff(o) {
	return o.toUpperCase() === 'ON' ? 'OFF' : 'ON';
}

function toggleit(button) {
	var outlet_num = button.id;
	var old_status = button.data;
	var new_status = onoff(button.data);
	var url = 'outlet?' + outlet_num + '=' + new_status;

	fetchpage(url, function(xhr, state) {
		console.log('switch ' + outlet_num + ': ' + old_status + ' -> ' + new_status);
		button.value = 'Switch ' + old_status;
		button.data = new_status;
	});
}
function toggle() {
	toggleit(this);
}

function toggle_confirmed() {
	clearTimeout(this.timeout);
	this.onclick = toggle_confirm;
	toggleit(this);
}

function toggle_confirm() {
	var button = this;
	this.onclick = toggle_confirmed;
	this.oldvalue = this.value;
	this.value = 'Confirm!?';
	this.timeout = setTimeout(function() {
		button.value = button.oldvalue;
		button.onclick = toggle_confirm;
	}, 5000);
}

function trim(str) {
	return str.replace(/^\s+|\s+$/, '');
}

function initpopup(xhr, state) {
	var tbl = document.getElementById('buttons');
	var row, cell, button;

	console.log(xhr, state);

	// There is no clean API for extracting the current state.
	// Example result:
	/*
		<tr>
		<th bgcolor="#DDDDFF" align=left>
		Controller: !!!Web Power Switch 6
		</th>
		</tr>
	*/

	var th, ths = state.currentTarget.responseXML.querySelectorAll('th');
	for (var i = 0; th = ths[i]; ++i) {
		if (th.bgColor != '#DDDDFF')
			continue;

		var controller_name = trim(th.innerText);
		if (controller_name.slice(0, 12) != 'Controller: ')
			continue;

		row = tbl.insertRow(-1);
		cell = row.insertCell(-1);
		cell.colSpan = 2;
		cell.align = 'center';
		cell.innerText = controller_name.slice(12);
		cell.innerHTML = '<a href="' + url_base + '" target="_blank">' + cell.innerHTML + '</a>'
	}

	/*
		<tr bgcolor="#F4F4F4"><td align=center>1</td>
		<td>Outlet 1</td><td>
		<b><font color=red>OFF</font></b></td><td>
		<a  href=outlet?1=ON>Switch ON</a>
		</td><td>
		<!-- <a  href=outlet?1=CCL>Cycle</a> -->
		</td></tr>
	*/

	var tr, trs = state.currentTarget.responseXML.querySelectorAll('tr');
	for (var i = 0; tr = trs[i]; ++i) {
		if (tr.bgColor != '#F4F4F4')
			continue;

		var outlet_num     = trim(tr.children[0].innerText);
		var outlet_name    = trim(tr.children[1].innerText);
		var current_status = trim(tr.children[2].innerText);
		var new_status     = trim(tr.children[3].innerText);
		var confirmable    = tr.children[3].children[0].hasAttribute('onclick');

		row = tbl.insertRow(-1);
		cell = row.insertCell(-1);
		if (outlet_name === '')
			cell.innerHTML = '<i>unnamed</i>';
		else
			cell.innerText = outlet_name + ':';
		cell = row.insertCell(-1);
		button = document.createElement('input');
		button.type = 'button';
		button.id = outlet_num;
		button.value = new_status;
		button.data = current_status;
		button.onclick = confirmable ? toggle_confirm : toggle;
		cell.appendChild(button);
	}

	setstatus();
}

function setstatus(msg) {
	var status = document.getElementById('status');
	status.innerHTML = msg;
	status.style.visibility = msg ? '' : 'hidden';
	status.style.float      = msg ? '' : 'left';
	status.style.position   = msg ? '' : 'absolute';
}

function open_settings_page() {
	chrome.runtime.openOptionsPage();
}

document.addEventListener('DOMContentLoaded', function() {
	storage.get(settings_keys, function(settings) {
		url_base = settings['url'] || settings_defaults['url'];
		user = settings['user'] || settings_defaults['user'];
		pass = settings['pass'] || settings_defaults['pass'];
		chrome.permissions.contains({
			origins: [url_base + '/*']
		}, function(granted) {
			if (granted) {
				fetchpage('index.htm', initpopup);
			} else {
				setstatus(
					'Missing permissions;<br>please visit the ' +
					'<a id="open-settings" href="">settings page</a>' +
					'<br>to grant access.<br>' +
					'<center><input id=retry type=submit value=Retry></center>'
				);
				document.getElementById('open-settings').onclick = open_settings_page;
				// Work around http://crbug.com/125706.
				document.getElementById('retry').onclick = function() {
					chrome.permissions.request({origins: [url_base + '/*']});
					fetchpage('index.htm', initpopup);
				};
			}
		});
	});
});
