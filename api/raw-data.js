var Data = require('./db/data-model'),
    Setup = require('./db/setup-model').setup,
    analyze = require('./crawlers/analyze'),
    CFG = require('./config'),
	User = require('./db/user-model');
var hex2str = function (hex) {
	var ret = '';

	for (var i = 0; i < hex.length; i+=2) {
		ret += String.fromCharCode(
			parseInt(hex.substr(i, 2), 16)
		);
	}
	return ret;
};
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
    Setup.findOne({network: ntw}, function (err, networkData) {
        Data.find(condition, function (err, dataArr) {
        	callback(err ? false : dataArr, networkData.keywords, networkData);
        });
    });
};
var sortData = function (a, b) {
    return b.post.found - a.post.found;
}
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
    	        groupInstance,
    	        cookie = req.cookies[CFG.user.sessionCookieName], login;
                login = hex2str(cookie.substring(43, cookie.length));
                User.findOne({login: login}, function (err, user) {
                	if (!data) {
                    	errHandler('Database error, failed to retrieve the data', 591, next);
                    } else {
                        data.forEach(function (item, index) {
                            groupInstance = {
                                group: item.group,
                                feeds: []
                            };
                            item.post.found = 0;
                            analyze(item.post, user.keywords[ntw], function (instance, count) {
                                var hasElement = false;
                                item.post.found += count;
                                groupInstance.feeds.forEach(function (post, index) {
                                    if (post.id === item.post.id) {
                                        hasElement = true;
                                        groupInstance.feeds[index].found += count;
                                    }
                                });
                                !hasElement && groupInstance.feeds.push(item.post);
                            });
                            if (groupInstance.feeds.length) {
                                postsArray.push(item);
                            }
                        });
                        postsArray.sort(sortData);
                        res.send(postsArray);
                    }

                });
    	});
    }
};