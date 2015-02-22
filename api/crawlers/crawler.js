var async = require('async'),
	cfg = require('../config'),
	State = require('../db/state-model'),
	Setup = require('../db/setup-model').setup,
	Data = require('../db/data-model'),
	analyze = require('./analyze'),
	crawlFBGroup = require('./fb-crawl-group'),
	crawlVKGroup = require('./vk-crawl-group'),
	Log = require('./log'),
    $log,
    network,
	interval = undefined,
	runAtFirstTime = true;


var crawler = function () {
	async.parallel(
		{
			state: function (cb) {
				State.findOne({network: network}, function (err, state) {
					cb(err || !state, state);
				});
			},
			setup: function (cb) {
				Setup.findOne({network: network}, function (err, setup) {
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
				    if (network === 'fb') {
					    crawlFBGroup(results.state, item, cb);
				    } else if (network === 'vk') {
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

var startCrawler = function () {
    var pollInterval = cfg[network] && cfg[network].pollInterval || 1000 * 60 * 10; // 10 min by default
    // pollInterval = 5 * 1000; // [rmelnyk] for testing purposes

    if (interval === undefined) {
        interval = setInterval(function () {
		    crawler();
		}, pollInterval);
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
			State.findOneAndUpdate({network: network}, {state: 'stopped'}, function (err, state) {
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

module.exports = function (ntw) {
    $log = Log(ntw);
    network = ntw;
    return {
        start: startCrawler,
        stop: stopCrawler
    }
};
