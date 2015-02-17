var cfg = require('../config'),
	request = require('request'),
	Data = require('../db/data-model');

/**
 * @private
 * @param {String} str
 * @return {Object|null}
 */
var jsonParse = function (str) {
	var ret;
	try {
		ret = JSON.parse(str);
	} catch (e) {
		ret = null;
	}
	return ret;
};

module.exports = function (state, group, callback) {
	var url,
		sinceTimestamp, nowTimestamp,
		since;

	if (state.state === 'auth-fail') {
		callback(true, 'auth-fail');
		return false;
	}

	url = cfg.fb.apiHost + cfg.fb.apiCommon + '/' + group.id + cfg.fb.apiFeed;

	nowTimestamp = Date.now();
	sinceTimestamp = (new Date(group.dataRerievedAt || 0)).getTime();
	since =
		nowTimestamp - sinceTimestamp > cfg.fb.loadDataBehind
		? nowTimestamp - cfg.fb.loadDataBehind
		: sinceTimestamp;
	since = Math.round(since / 1000);

	request.get(
			url + '?since=' + since + '&access_token=' + state.token,
		function (err, response, body) {
			body = jsonParse(body);
			if (body && body.error && body.error.type === 'OAuthException') {
				callback(true, 'auth-fail');
			} else if (body && body.data) {
				if (body.data.length > 0) {
					var data = new Data({
						url: url,
						type: 'feed',
						payload: body.data,
						date: Date.now(),
						network: 'fb'
					});
					data.save(function (err, data) {
						if (err) {
							console.log('[ ERR ] [ FB crawler ]: failed to save the data from the feed page');
							callback(true, null);
						} else {
							group.dataRecievedAt = new Date();
							callback(false, group);
						}
					});
				} else {
					// do not save empty results
					group.dataRecievedAt = new Date();
					callback(false, group);
				}
			} else {
				console.log('[ ERR ] [ FB crawler ]: the API returned the unknown data format');
				callback(true, null);
			}
		});

	return true;
};
