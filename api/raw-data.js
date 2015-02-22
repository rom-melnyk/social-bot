var Data = require('./db/data-model');

var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

var getData = function (ntw, since, callback) {
	var condition = {network: ntw};
	if (since) {
		condition.date = {$gt: new Date(since)}
	}

	Data.find(condition, function (err, dataArr) {
		callback(err ? false : dataArr);
	});
};

module.exports = {
	/**
	 * @method GET
	 * @query-params {Number} since					optional; the timestamp of the last retrieved-at-date to pick
	 */
	getRawData: function (req, res, next) {
		var ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter', 592, next);
			return;
		}

		var since;
		try {
			since = (new Date(+req.query.since)).getTime();
		} catch (e) {
			since = undefined;
		}

		getData(ntw, since, function (data) {
			if (!data) {
				errHandler('Database error, failed to retrieve the data', 591, next);
			} else {
				res.send(data);
			}
		})
	}
};