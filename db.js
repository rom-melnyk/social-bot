var async = require('async'),
	Setup = require('./api/db/setup-model').setup,
	Data = require('./api/db/data-model'),
	State = require('./api/db/state-model');

require('./api/db/connect');

var networks = ['fb', 'vk'];

async.parallel(
	[
		function (cb) {
			// ------------------ preparing the "setups" table ------------------
			Setup.remove({}, function (err) {
				if (err) {
					console.log('[ ERR ] Unable to clean the "setups" collection');
				}

				async.map(networks,
					function (ntw, _cb) {
						var setup = new Setup({
							network: ntw,
							keywords: [],
							groups: []
						});
						setup.save(function (err, setup) {
							if (err) {
								console.log('[ ERR ] Unable to save the setup for the "' + ntw + '"');
								_cb(true, ntw);
							} else {
								console.log('[ i ] The setup for the "' + ntw + '" initialized');
								_cb(null, ntw);
							}
						});
					},
					function (err, result) {
						cb(err, 'setups');
					}
				);
			});
		},

		function (cb) {
			// ------------------ preparing the "states" table ------------------
			State.remove({}, function (err) {
				if (err) {
					console.log('[ ERR ] Unable to clean the "states" collection');
				}

				async.map(networks,
					function (ntw, _cb) {
						var state = new State({
							state: 'auth-fail',
							stateUpdatedAt: Date.now(),
							token: '',
							tokenUpdatedAt: Date.now(),
							network: ntw
						});
						state.save(function (err, setup) {
							if (err) {
								console.log('[ ERR ] Unable to save the setup for the "' + ntw + '"');
								_cb(true, 'states');
							} else {
								console.log('[ i ] The state for the "' + ntw + '" initialized');
								_cb(null, 'states');
							}
						});
					},
					function (err, result) {
						cb(err, 'states');
					}
				);
			});
		},

		function (cb) {
			// ------------------ preparing the "datas" table ------------------
			Data.remove({}, function (err) {
				if (err) {
					console.log('[ ERR ] Unable to clean the "datas" collection');
					cb(true, 'datas');
				} else {
					console.log('[ i ] The "datas" collection prepared');
					cb(null, 'datas');
				}
			});
		}
	],

	function (err, result) {
		if (!err) {
			console.log('[ i ] Finished: "' + result.join('", "') + '"');
		}
		process.exit(0);
	}
);

