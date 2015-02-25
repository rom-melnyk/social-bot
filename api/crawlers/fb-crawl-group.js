var cfg = require('../config'),
	request = require('request'),
	Data = require('../db/data-model'),
	$log = require('./log')('fb'),
	jsonParse = require('./json-parse');

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
	sinceTimestamp = (new Date(group.dataRetrievedAt || 0)).getTime();
	since =
		nowTimestamp - sinceTimestamp > cfg.fb.loadDataBehind
		? nowTimestamp - cfg.fb.loadDataBehind
		: sinceTimestamp;
	// since = nowTimestamp - 1000 * 60 * 60 * 24 * 5; // [rmelnyk] for test purposes only!
	since = Math.round(since / 1000);

	request.get(
			url + '?since=' + since
				// the "&fields" might be removed if you need the exhaustive data
				+ '&fields=id,from,message,name,description,comments'
				+ '&access_token=' + state.token,
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
						network: 'fb',
						group: group
					});
					data.save(function (err, data) {
						if (err) {
							$log('e', 'failed to save the data from the feed page');
							callback(true, null);
						} else {
							$log('i', ''
								+ 'group ' + group.name
								+ '; found ' + body.data.length + ' new items');
							group.dataRetrievedAt = new Date();
							callback(false, {group: group, data: data});
						}
					});
				} else {
					// do not save empty results
					// $log('i', ''
					// 	+ 'group ' + group.name
					// 	+ '; nothing changed since ' + group.dataRetrievedAt.toString());
					group.dataRetrievedAt = new Date();
					callback(false, null);
				}
			} else {
				$log('e', 'the API returned the unknown data format');
				callback(true, null);
			}
		});

	return true;
};
