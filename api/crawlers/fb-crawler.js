var async = require('async'),
	cfg = require('../config'),
	State = require('../db/state-model'),
	Setup = require('../db/setup-model').setup,
	Data = require('../db/data-model'),
	analyze = require('./analyze'),
	crawlFBGroup = require('./fb-crawl-group'),
	crawlVKGroup = require('./vk-crawl-group'),
	$log = require('./log'),
	interval = undefined,
	runAtFirstTime = true;


var crawler = function (ntw) {
	async.parallel(
		{
			state: function (cb) {
				State.findOne({network: ntw}, function (err, state) {
					cb(err || !state, state);
				});
			},
			setup: function (cb) {
				Setup.findOne({network: ntw}, function (err, setup) {
					cb(err || !setup, setup);
				});
			}
		},
		function (err, results) {
			if (err || !results.state || !results.setup) {
				$log(ntw)('e','failed to retrieve the State or the Setup');
				stopCrawler(ntw);
				return;
			}

			if (results.state.state === 'auth-fail') {
				$log(ntw)('i', 'not authenticated');
				stopCrawler(ntw);
				return;
			}

			if (runAtFirstTime) {
				$log(ntw)('i', results.setup.groups.length + ' groups found');
				runAtFirstTime = false;
			}
			async.map(
				results.setup.groups,
				function (item, cb) {
				    if (ntw === 'fb') {
					    crawlFBGroup(results.state, item, cb);
				    } else if (ntw === 'vk') {
				        setTimeout(function () {
				            crawlVKGroup(results.state, item, cb);
				        }, 350 * results.setup.groups.indexOf(item));
				    }
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
							$log(ntw)('e', 'failed to update the state');
							stopCrawler(ntw);
						}
					});
					results.setup.save(function (err, setup) {
						if (err) {
							$log(ntw)('e', 'failed to update the setup');
							stopCrawler(ntw);
						}
					});

					if (err) {
						stopCrawler(ntw);
					} else {
						_res.forEach(function (obj) {
							if (!obj || !obj.group || !obj.data) {
								return;
							}

							// concatenating network and groups keywords into one array
							var keywords = [].concat(obj.group.keywords);
							results.setup.keywords.forEach(function (kw) {
							    if (keywords.indexOf(kw) === -1) {
							        keywords.push(kw);
							    }
							});
							analyze(obj.data.payload, keywords, function (instance) {
								console.log('-----------');
								console.log(obj.group.name + ": ");
								console.log(instance);
								console.log('-----------');
							});
						});
					}
				});
		}
	);
};

var startCrawler = function (ntw) {
	if (interval === undefined) {
		interval = setInterval(function () {
		    crawler(ntw);
		}, cfg.fb.pollInterval);
		$log(ntw)('i', 'started');
	} else {
		$log(ntw)('w', 'already running; won\'t start twice');
	}
};

/**
 * @param {Boolean} [force=false]				whether or not to update the state intentionally
 */
var stopCrawler = function (ntw, force) {
	if (interval !== undefined) {
		clearInterval(interval);
		interval = undefined;

		if (force) {
			State.findOneAndUpdate({network: ntw}, {state: 'stopped'}, function (err, state) {
				if (err) {
					$log(ntw)('e', 'failed to update the state');
				}
			});
		}
		$log(ntw)('i', 'stopped');
		runAtFirstTime = true;
	} else {
		$log(ntw)('w', 'not running; nothing to stop');
	}
};

module.exports = {
	start: startCrawler,
	stop: stopCrawler
};
