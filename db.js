var async = require('async'),
	cfg = require('./api/config'),
	Setup = require('./api/db/setup-model').setup,
	Data = require('./api/db/data-model'),
	State = require('./api/db/state-model'),
	User = require('./api/db/user-model');

require('./api/db/connect');

var networks = ['fb', 'vk'];

var confirmed = cfg.dropDbConfirmed[cfg.env];
if (!confirmed) {
	console.log('[ ! ] This command drops all the %s data', cfg.env.toUpperCase());
	console.log('[ ERR ] Use it with the parameter "%s" to proceed.', 'idrop' + cfg.env + 'database');
	process.exit(1);
}

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
		},

		function (cb) {
			// ------------------ preparing the "users" table ------------------
			User.remove({}, function (err) {
				if (err) {
					console.log('[ ERR ] Unable to clean the "users" collection');
					cb(true, 'users');
				} else {
					console.log('[ i ] The "users" collection prepared');
					cb(null, 'users');
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

