var cfg = require('../config'),
	request = require('request');

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

module.exports = function (state, setup, group, callback) {
	var url,
		since;

	if (state.state === 'auth-fail') {
		callback(true, null);
		return false;
	}

	url = cfg.fb.apiHost + cfg.fb.apiCommon + '/' + group.id + cfg.fb.apiFeed;

	since = Date.now() - 1000 * 60 * 60 * 24;
	if (since < (new Date(state.successfulDataRetrievalDate)).getTime()) {
		since = (new Date(state.successfulDataRetrievalDate)).getTime();
	}
	since = Math.round(since / 1000);

	request.get(
			url + '?since=' + since + '&access_token=' + state.state,
		function (err, response, body) {
			body = jsonParse(body);
			if (body && body.error && body.error.type === 'OAuthException') {
				state.state = 'auth-fail';
				state.save(function (err, state) {
					if (err) {
						console.log('[ ERR ] [ FB crawler ]: failed to update the state');
					}
				});
			} else if (body && body.data) {
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
					}
				});
				state.state = 'running';
				state.successfulDataRetrievalDate = Date.now();
				state.save(function (err, state) {
					if (err) {
						console.log('[ ERR ] [ FB crawler ]: failed to update the state');
					}
				});
			} else {
				console.log('[ ERR ] [ FB crawler ]: the API returned the unknown data format');
			}
		});

	return true;
};
