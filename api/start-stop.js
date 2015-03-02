var State = require('./db/state-model'),
    crawler = require('./crawlers/crawler'),
    ntwCrawlers = {};

var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

State.find({}, function (err, states) {
    if (err) {
        console.log('[ warn ] Failed to reset states');
    }

    states.forEach(function (state) {
        state.state = 'stopped';
        state.save();
    });
});

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
        if (!ntwCrawlers[ntw]) {
            ntwCrawlers[ntw] = crawler(ntw);
        }
		ntwCrawlers[ntw].start();
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
        if (ntwCrawlers[ntw]) {
            ntwCrawlers[ntw].stop(true);
        }
		res.status(200).send({
			network: ntw,
			status: 'stopped'
		});

	}
};
