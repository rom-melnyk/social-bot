var Setup = require('./db/setup-model').setup,
	Group = require('./db/setup-model').group;

var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

module.exports = {
	/**
	 * @method GET
	 * @path /api/setup/:network
	 * Returns the config of the particular network
	 */
	getAllGroups: function (req, res, next) {
		var ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				res.status(200).send(setup);
			}
		});
	},

	/**
	 * @method POST
	 * @path /api/setup/:network
	 * @payload {Object}					according to the ./db/setup-model#GroupSchema
	 * Creates the new group for the network
	 */
	createGroup: function (req, res, next) {
		var ntw = req.params.network,
			body = req.body || {};

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				if (!setup) {
					throw new Error('The no entry for the "' + ntw + '" found in the "setups" collection.');
				} else {
					setup.groups.push({
						id: body.id,
						name: body.name,
						description: body.description,
						keywords: body.keywords
					});
					setup.save(function (err, setup) {
						if (err) {
							errHandler('Database error, failed to update the setup', 591, next);
						} else {
							res.status(200).send(setup);
						}
					});
				}
			}
		});
	}
};