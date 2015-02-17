var async = require('async'),
	cfg = require('../config'),
	State = require('../db/state-model'),
	Setup = require('../db/setup-model').setup,
	Data = require('../db/data-model'),
	crawlGroup = require('./fb-crawl-group'),
	interval = undefined;


var crawler = function () {
	async.parallel(
		{
			state: function (cb) {
				State.findOne({network: 'fb'}, function (err, state) {
					cb(err || !state, state);
				});
			},
			setup: function (cb) {
				Setup.findOne({network: 'fb'}, function (err, setup) {
					cb(err || !setup, setup);
				});
			}
		},
		function (err, results) {
			if (err || !results.state || !results.setup) {
				console.log('[ ERR ] ' + (new Date()).toString() + ' [ FB crawler ]: failed to retrieve the State or the Setup');
				stopCrawler();
				return;
			}

			if (results.state.state === 'auth-fail') {
				console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: not authenticated');
				stopCrawler();
				return;
			}

			// TODO adopt the `crawlGroup(state, group, cb)` for this call
			async.map(
				results.setup.groups,
				function (item, cb) {
					crawlGroup(results.state, item, cb);
				},
				function (err, _res) {
					if (err) {
						if (_res.indexOf('auth-fail') !== -1) {
							results.state.state = 'auth-fail';
						} else {
							results.state.state = 'stopped';
						}
					} else {
						results.state.state = 'running';
					}
					results.state.stateUpdatedAt = Date.now();
					results.state.save(function (err, state) {
						if (err) {
							console.log('[ ERR ] ' + (new Date()).toString() + ' [ FB crawler ]: failed to update the state');
							stopCrawler();
						}
					});
					results.setup.save(function (err, setup) {
						if (err) {
							console.log('[ ERR ] ' + (new Date()).toString() + ' [ FB crawler ]: failed to update the setup');
							stopCrawler();
						}
					});

					if (err) {
						stopCrawler();
					}
				});
		}
	);
};

var startCrawler = function () {
	if (interval === undefined) {
		interval = setInterval(crawler, cfg.fb.pollInterval);
		console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: started');
	} else {
		console.log('[ w ] ' + (new Date()).toString() + ' [ FB crawler ]: already running; won\'t start twice');
	}
};

/**
 * @param {Boolean} [force=false]				whether or not to update the state intentionally
 */
var stopCrawler = function (force) {
	if (interval !== undefined) {
		clearInterval(interval);
		interval = undefined;

		if (force) {
			State.findOneAndUpdate({network: 'fb'}, {state: 'stopped'}, function (err, state) {
				if (err) {
					console.log('[ ERR ] ' + (new Date()).toString() + ' [ FB crawler ]: failed to update the state');
				}
			});
		}
		console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: stopped');
	} else {
		console.log('[ w ] ' + (new Date()).toString() + ' [ FB crawler ]: not running; nothing to stop');
	}
};

module.exports = {
	start: startCrawler,
	stop: stopCrawler
};
