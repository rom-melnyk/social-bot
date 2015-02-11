var request = require('request'),
	cfg = require('./config'),
	mongoose = require('mongoose'),
	State = require('./db/state-model');

var dbUrl = 'mongodb://' + cfg.db.host + '/' + cfg.db.name;
mongoose.connect(dbUrl);

var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

var __createNewToken = function (ntw, req, res, next) {
	var state = new State({
		state: 'auth-fail',
		token: '',
		tokenDate: Date.now(),
		network: ntw
	});
	state.save(function (err, state) {
		if (err) {
			errHandler('Database error, failed to create the new token for the network "fb"', 591, next);
		} else {
			res.status(200).send({
				state: state.state,
				token: state.token,
				date: state.tokenDate,
				network: state.network
			});
		}
	})
};

module.exports = {
	/**
	 * @method GET
	 * @path /api/token/:network				:network must be in ["fb", "vk"]
	 * Returns the object with the auth status
	 */
	check: function (req, res, next) {
		var ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter', 592, next);
			return;
		}

		State.findOne({network: ntw}, function (err, state) {
			if (err) {
				errHandler('Database error, failed to find the token for the network "fb"', 590, next);
			} else {
				if (!state) {
					__createNewToken(ntw, req, res, next);
				} else {
					res.status(200).send({
						state: state.state,
						token: state.token,
						date: state.tokenDate,
						network: state.network
					});
				}

			}
		});
	},

	/**
	 * @method PUT
	 * @path /api/token/:network				:network must be in ["fb", "vk"]
	 * @payload {Object}						{token: "...."}
	 * Saves the token
	 */
	save: function (req, res, next) {
		var tkn = req.body.token || '',
			ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter', 592, next);
			return;
		}

		State.findOne({network: ntw}, function (err, state) {
			if (err) {
				errHandler('Database error, failed to retrieve the token', 593, next);
			} else {
				if (!state) {
					__createNewToken(ntw, req, res, next);
				} else {
					state.state = 'token-updated';
					state.token = tkn;
					state.tokenDate = Date.now();
					state.save(function (err, state) {
						if (err) {
							errHandler('Database error, failed to update the token', 594, next);
						} else {
							res.status(200).send({
								state: state.state,
								token: state.token,
								date: state.tokenDate,
								network: state.network
							});
						}
					});
				}
			}
		});
	}
};
