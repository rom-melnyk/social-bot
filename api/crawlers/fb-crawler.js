var async = require('async'),
	cfg = require('../config'),
	State = require('../db/state-model'),
	Setup = require('../db/setup-model'),
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
				clearInterval(interval);
				return;
			}

			if (results.state.state === 'auth-fail') {
				console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: not authenticated');
				clearInterval(interval);
				return;
			}

			// TODO adopt the `crawlGroup(item, cb)` for this call
			async.map(setup.groups, crawlGroup, function (err, _res) {
				// we update the state ans the setup anyway;
				if (!err) {
					results.state.state = 'running';
				}
				results.state.stateUpdatedAt = Date.now();
				results.state.save(function (err, state) {
					if (err) {
						console.log('[ ERR ] ' + (new Date()).toString() + ' [ FB crawler ]: failed to update the state');
						clearInterval(interval);
					}
				});
				results.setup.save(function (err, setup) {
					if (err) {
						console.log('[ ERR ] ' + (new Date()).toString() + ' [ FB crawler ]: failed to update the setup');
						clearInterval(interval);
					}
				});

				if (err) {
					clearInterval(interval);
				}
			});
		}
	);
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
