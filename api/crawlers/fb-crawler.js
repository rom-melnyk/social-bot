var async = require('async'),
	cfg = require('../config'),
	State = require('../db/state-model'),
	Setup = require('../db/setup-model').setup,
	Data = require('../db/data-model'),
	analyze = require('./analyze'),
	crawlGroup = require('./fb-crawl-group'),
	$log = require('./log')('fb'),
	interval = undefined,
	runAtFirstTime = true;


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
				$log('e','failed to retrieve the State or the Setup');
				stopCrawler();
				return;
			}

			if (results.state.state === 'auth-fail') {
				$log('i', 'not authenticated');
				stopCrawler();
				return;
			}

			if (runAtFirstTime) {
				$log('i', results.setup.groups.length + ' groups found');
				runAtFirstTime = false;
			}
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
							$log('e', 'failed to update the state');
							stopCrawler();
						}
					});
					results.setup.save(function (err, setup) {
						if (err) {
							$log('e', 'failed to update the setup');
							stopCrawler();
						}
					});

					if (err) {
						stopCrawler();
					} else {
						_res.forEach(function (obj) {
							if (!obj || !obj.group || !obj.data) {
								return;
							}

							// perform the analysis twice; once for per-group keywords,...
							analyze(obj.data.payload, obj.group.keywords, function (instance) {
								console.log('-----------');
								console.log(obj.group.name + ": ");
								console.log(instance);
								console.log('-----------');
							});
							// ...and second time for per-network keywords
							analyze(obj.data.payload, results.setup.keywords, function (instance) {
								console.log('-----------');
								console.log(instance);
								console.log('-----------');
							});
						});
					}
				});
		}
	);
};

var startCrawler = function () {
	if (interval === undefined) {
		interval = setInterval(crawler, cfg.fb.pollInterval);
		$log('i', 'started');
	} else {
		$log('w', 'already running; won\'t start twice');
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
					$log('e', 'failed to update the state');
				}
			});
		}
		$log('i', 'stopped');
		runAtFirstTime = true;
	} else {
		$log('w', 'not running; nothing to stop');
	}
};

module.exports = {
	start: startCrawler,
	stop: stopCrawler
};
