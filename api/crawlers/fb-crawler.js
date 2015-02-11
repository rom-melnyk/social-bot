var cfg = require('../config'),
	request = require('request'),
	State = require('../db/state-model'),
	Data = require('../db/data-model'),
	interval = undefined;

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

/**
 * @private
 * @return {Boolean}
 * Crawls the arbitrary group
 */
var __crawlGroup = function (state, gid) {
	var url,
		since;

	if (state.state === 'auth-fail') {
		return false;
	}

	url = cfg.fb.apiHost + cfg.fb.apiCommon + '/' + gid + cfg.fb.apiFeed;

	since = Date.now() - 1000 * 60 * 60 * 24;
	if (since < (new Date(state.successfulDataRetrievalDate)).getTime()) {
		since = (new Date(state.successfulDataRetrievalDate)).getTime();
	}
	since = Math.round(since / 1000);

	request.get(
		url + '?since=' + since + '&access_token=' + state.token,
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

var crawler = function () {
	State.findOne({network: 'fb'}, function (err, state) {
		if (err || !state) {
			// console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: state not found; skipping');
			return;
		}

		if (state.state === 'auth-fail') {
			console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: not authenticated; skipping');
			return;
		}

		for (var i = 0; i < cfg.fb.groups.length; i++) {
			if (!__crawlGroup(state, cfg.fb.groups[i])) {
				break;
			}
		}

	});
};

module.exports = {
	start: function () {
		if (interval === undefined) {
			interval = setInterval(crawler, cfg.fb.pollInterval);
		}
		console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: started');
	},
	stop: function () {
		if (interval !== undefined) {
			clearInterval(interval);
		}
		console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: stopped');
	}
};
