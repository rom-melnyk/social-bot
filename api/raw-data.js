var Data = require('./db/data-model'),
    Setup = require('./db/setup-model').setup,
    analyze = require('./crawlers/analyze');

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
    Setup.findOne(condition, function (err, networkData) {
        Data.find(condition, function (err, dataArr) {
        	callback(err ? false : dataArr, networkData.keywords, networkData);
        });
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

		getData(ntw, since, function (data, keywords) {
			if (!data) {
				errHandler('Database error, failed to retrieve the data', 591, next);
			} else {
				res.send(data);
			}
		})
	},
	getAnalyzedData: function (req, res, next) {
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

    	getData(ntw, since, function (data, keywords) {
    	    var postsArray = [],
    	        groupInstance;
    		if (!data) {
    			errHandler('Database error, failed to retrieve the data', 591, next);
    		} else {
    		    data.forEach(function (item, index) {
    		        groupInstance = {
                        group: item.group,
                        payload: []
                    };
    		        item.payload.forEach(function (post) {
    		            analyze(post, keywords, function (instance) {
    		                if (groupInstance.payload.indexOf(post) === -1) {
    			                groupInstance.payload.push(post);
    		                }
    		            });
    		        });
    		        if (groupInstance.payload.length) {
    		            postsArray.push(groupInstance);
    		        }
    		    });
    		    res.send(postsArray);
    		}
    	});
    }
};