var cfg = require('../config'),
	request = require('request'),
	State = require('../db/state-model'),
	interval = undefined;

var crawler = function () {
	State.findOne({network: 'fb'}, function (err, state) {
		if (!err && state) {
			if (state.state === 'auth-fail') {
				console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: not authenticated; skipping');
			} else {
				var url = cfg.fb.apiHost + cfg.fb.apiCommon + cfg.fb.testMe;
				url += '?token=' + state.token;
				request.get(url, function (err, response, body) {
					console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: got the info:');
					console.log(body);
					try {
						body = JSON.parse(body);
					} catch (e) {
						body = null;
					}
					if (body && body.error && body.error.type === 'OAuthException') {
						state.state = 'auth-fail';
						state.save(function (err, state) {
							if (err) {
								console.log('[ ERR ] [ FB crawler ]: failed to update the state');
							}
						});
					}
				});
			}
		} else {
			console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: state not found; skipping');
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
