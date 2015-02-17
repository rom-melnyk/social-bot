require('array.prototype.find');
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
	 * @method PUT
	 * @path /api/setup/:network
	 * @payload {Object}					according to the ./db/setup-model#setup
	 * Updates the whole Setup entry for the network.
	 * **Use with caution! Overwrites all the existing data!**
	 */
	updateAllGroups: function (req, res, next) {
		var ntw = req.params.network,
			body = req.body || {};

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOneAndUpdate({network: ntw}, body, function (err, setup) {
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
	 * @payload {Object}					according to the ./db/setup-model#group
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
	},

	/**
	 * @method PUT
	 * @path /api/setup/:network/keywords
	 * @payload {Object}					{keywords: ["abc", "def"]}
	 * Updates the keywords on the network level
	 * (will be applicable to all groups regardless the group itself contains such keyword or not).
	 */
	updateNetworkKeywords: function (req, res, next) {
		var ntw = req.params.network,
			body = req.body || {};

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOneAndUpdate({network: ntw}, {keywords: body.keywords || []}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				res.status(200).send(setup);
			}
		});
	},

	/**
	 * @method GET
	 * @path /api/setup/:network/:gid
	 * Returns the config of the particular group in the network
	 */
	getGroup: function (req, res, next) {
		var ntw = req.params.network,
			gid = req.params.gid;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				var group = setup.groups.find(function (grp) {
					return grp.id + '' === gid + '';
				});

				if (group) {
					res.status(200).send(group);
				} else {
					errHandler('Request error, the group "' + gid + '" not found', 590, next);
				}
			}
		})
	},

	/**
	 * @method PUT
	 * @path /api/setup/:network/:gid
	 * Updates the config of the particular group
	 */
	updateGroup: function (req, res, next) {
		var ntw = req.params.network,
			gid = req.params.gid,
			body = req.body || {};

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				var group = setup.groups.find(function (grp) {
					return grp.id + '' === gid + '';
				});

				if (!group) {
					errHandler('Request error, the group "' + gid + '" not found', 590, next);
				} else {
					['name', 'description', 'keywords'].forEach(function (prop) {
						if (body[prop]) {
							group[prop] = body[prop];
						}
					});
					setup.save(function (err, setup) {
						if (err) {
							errHandler('Database error, failed to update the setup', 591, next);
						} else {
							res.status(200).send(group);
						}
					});
				}
			}
		})
	},

	/**
	 * @method DELETE
	 * @path /api/setup/:network/:gid
	 * Removes the group
	 */
	deleteGroup: function (req, res, next) {
		var ntw = req.params.network,
			gid = req.params.gid;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				var updatedGroups = setup.groups.filter(function (grp) {
					return grp.id + '' !== gid + '';
				});

				setup.groups = updatedGroups;
				setup.save(function (err, setup) {
					if (err) {
						errHandler('Database error, failed to update the setup', 591, next);
					} else {
						res.status(200).send(setup);
					}
				});
			}
		})
	}
};