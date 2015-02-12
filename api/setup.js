var Setup = require('./db/setup-model');

var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

module.exports = {
	getAllGroups: function (req, res, next) {
		var ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to create the new state for the network "fb"', 591, next);
			} else {
				res.status(200).send(setup);
			}
		});
	},

	createGroup :function (req, res, next) {
		var ntw = req.params.network,
			body = req.body || {};

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup
	}
};