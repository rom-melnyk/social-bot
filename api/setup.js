require('array.prototype.find');
var Setup = require('./db/setup-model').setup,
    Data = require('./db/data-model'),
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
			var _setup;
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				_setup = {
					network: setup.network,
					keywords: setup.keywords,
					groups: []
				};
				setup.groups.forEach(function (grp) {
					_setup.groups.push({
						id: grp.id,
						name: grp.name,
						description: grp.description,
						keywords: grp.keywords
					});
				});
				res.status(200).send(_setup);
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

		// following shouldn't be updated
		delete body._id;
		delete body.network;
		if (body.groups && body.groups.forEach) {
			body.groups.forEach(function (grp) {
				delete grp._id;
			});
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

		delete body._id;
		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				if (!setup) {
					throw new Error('The no entry for the "' + ntw + '" found in the "setups" collection.');
				} else {
				    var group = setup.groups.find(function (grp) {
                    	return grp.id + '' === body.id + '';
                    });

                    if (group) {
                        errHandler('Group with id "' + body.id + '" already exists', 591, next);
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
					res.status(200).send({
						id: group.id,
						name: group.name,
						description: group.description,
						keywords: group.keywords
					});
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
			gid = req.params.gid + '';

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter - "' + ntw + '"', 590, next);
			return;
		}

		Setup.findOne({network: ntw}, function (err, setup) {
			if (err) {
				errHandler('Database error, failed to retrieve the setup', 591, next);
			} else {
				var updatedGroups = setup.groups.filter(function (grp) {
					return grp.id + '' !== gid;
				});

				setup.groups = updatedGroups;
				setup.save(function (err, setup) {
					if (err) {
						errHandler('Database error, failed to update the setup', 591, next);
					} else {
                        Data.remove({'gid': gid}, function (err, items) {
						    res.status(200).send(setup);
                        });
					}
				});
			}
		})
	},

	/**
	 * @method GET
	 * @path /api/setup/:network/reset-dates
	 * Reset dates in all the groups
	 */
    resetDates: function (req, res, next) {
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
                setup.groups.forEach(function (grp) {
                    grp.dataRetrievedAt = new Date(0);
                });
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