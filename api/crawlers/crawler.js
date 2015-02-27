var async = require('async'),
	cfg = require('../config'),
	State = require('../db/state-model'),
	Setup = require('../db/setup-model').setup,
	Data = require('../db/data-model'),
	analyze = require('./analyze'),
	crawlFBGroup = require('./fb-crawl-group'),
	crawlVKGroup = require('./vk-crawl-group'),
	vkQueue = require('./vk-queue'),
	Log = require('./log'),
	$log,
	network,
	interval = {
	    vk: undefined,
	    fb: undefined
	},
	runAtFirstTime = true;
//actions for retrieved data
var actionConsoleLog = require('../actions/action-console-log'),
    mailer = require('../actions/mailer');

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
				$log('e', 'failed to retrieve the State or the Setup');
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
					    vkQueue.add(function (vkQcb) {
					        crawlVKGroup(results.state, item, cb, vkQcb);
					    });
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
						startCrawler();
					} else {
					    var responseArray = [];
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
							obj.data.payload.forEach(function (post) {
							    analyze(post, keywords, function (instance) {
                                	// Place here all the actions you want to perform with the data containing a keyword.
                                	// Actions should reside in "../actions" and must be included via `require()` well.
                                	// Make sure you pass the config that might be useful for the Action as the first param.
                                	actionConsoleLog({
                                		network: network,
                                		group: obj.group,
                                		keywords: keywords
                                	}, instance);
                                	var responseObj = {
                                        network: network,
                                        group: obj.group,
                                        keywords: keywords,
                                        instance: post,
                                        found: 1
                                    }, hasElement = false;
                                    responseArray.forEach(function (item) {
                                        if (item.instance.id === responseObj.instance.id) {
                                            hasElement = true;
                                        } else {
                                            item.count++;
                                        }
                                    });
                                    !hasElement && responseArray.push(responseObj);
                                });
							});
						});
						if (responseArray.length) {
						    mailer(responseArray);
						}
					}
				});
		}
	);
};

var startCrawler = function () {
	var pollInterval = cfg[network] && cfg[network].pollInterval || 1000 * 60 * 10; // 10 min by default
	// pollInterval = 5 * 1000; // [rmelnyk] for testing purposes

	if (interval[network] === undefined) {
		interval[network] = setInterval(function () {
			crawler();
		}, pollInterval);
		$log('i', 'started');
	} else {
		$log('w', 'already running; won\'t start twice');
	}
};

/**
 * @param {Boolean} [force=false]                whether or not to update the state intentionally
 */
var stopCrawler = function (force) {
	if (interval[network] !== undefined) {
		clearInterval(interval[network]);
		interval[network] = undefined;

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
