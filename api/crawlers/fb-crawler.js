var cfg = require('../config'),
	State = require('../db/state-model'),
	Setup = require('../db/setup-model'),
	Data = require('../db/data-model'),
	crawlGroup = require('./fb-crawl-group'),
	interval = undefined;


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

		Setup.findOne({network: 'fb'}, function (err, setup) {
			if (err || !setup) {
				// console.log('[ i ] ' + (new Date()).toString() + ' [ FB crawler ]: setup not found; skipping');
				return;
			}

			for (var i = 0; i < setup.groups.length; i++) {
				if (!crawlGroup(state, cfg.fb.groups[i])) {
					break;
				}
			}
		});

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
