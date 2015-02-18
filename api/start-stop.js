var fbCrawler = require('./crawlers/fb-crawler');

var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

module.exports = {
	/**
	 * @method GET
	 * @path /api/start/:network					:network must be in ["fb", "vk"]
	 * */
	start: function (req, res, next) {
		var ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter', 592, next);
			return;
		}

		fbCrawler.start();
		res.status(200).send({
			network: ntw,
			status: 'started'
		});
	},

	/**
	 * @method GET
	 * @path /api/stop/:network					:network must be in ["fb", "vk"]
	 * */
	stop: function (req, res, next) {
		var ntw = req.params.network;

		if (!(ntw === 'fb' || ntw === 'vk')) {
			errHandler('Request error, wrong "network" parameter', 592, next);
			return;
		}

		if (ntw === 'fb') {
		    fbCrawler.stop(true);
		} else if (ntw === 'fb') {
		    // TBD
		    // vkCrawler.stop(true);
		}
		res.status(200).send({
			network: ntw,
			status: 'stopped'
		});

	}
};
