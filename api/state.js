var State = require('./db/state-model');

var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

module.exports = {
	/**
	 * @method GET
	 * @path /api/state/:network				:network must be in ["fb", "vk"]
	 * Returns the object with the auth status
	 */
	check: function (req, res, next) {
		var ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		State.findOne({network: ntw}, function (err, state) {
			if (err) {
				errHandler('Database error, failed to retrieve the state', 591, next);
			} else {
				if (!state) {
					throw new Error('The no entry for the "' + ntw + '" found in the "states" collection.');
				} else {
					res.status(200).send({
						state: state.state,
						stateUpdatedAt: state.stateUpdatedAt,
						token: state.token,
						tokenUpdatedAt: state.tokenUpdatedAt,
						network: state.network
					});
				}

			}
		});
	},

	/**
	 * @method PUT
	 * @path /api/state/:network				:network must be in ["fb", "vk"]
	 * @payload {Object}						{state: "...."}
	 * Saves the state
	 */
	save: function (req, res, next) {
		var tkn = req.body.token || '',
			ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		State.findOne({network: ntw}, function (err, state) {
			if (err) {
				errHandler('Database error, failed to retrieve the state', 591, next);
			} else {
				if (!state) {
					throw new Error('The no entry for the "' + ntw + '" found in the "states" collection.');
				} else {
					state.state = 'token-updated';
					state.stateUpdatedAt = Date.now();
					state.token = tkn;
					state.tokenUpdatedAt = Date.now();
					state.save(function (err, state) {
						if (err) {
							errHandler('Database error, failed to update the state', 591, next);
						} else {
							res.status(200).send({
								state: state.state,
								stateUpdatedAt: state.stateUpdatedAt,
								token: state.token,
								tokenUpdatedAt: state.tokenUpdatedAt,
								network: state.network
							});
						}
					});
				}
			}
		});
	}
};
