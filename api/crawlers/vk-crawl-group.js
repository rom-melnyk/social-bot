var cfg = require('../config'),
    async = require('async'),
	request = require('request'),
	Data = require('../db/data-model'),
	$log = require('./log')('vk'),
	jsonParse = require('./json-parse'),
	vkQueue = require('./vk-queue');

module.exports = function (state, group, callback, vkQcb) {
	var url,
	    commentsUrl,
		sinceTimestamp, nowTimestamp,
		since;

	if (state.state === 'auth-fail') {
		callback(true, 'auth-fail');
		return false;
	}

	url = cfg.vk.apiHost + cfg.vk.apiFeed;
	commentsUrl = cfg.vk.apiHost + cfg.vk.apiComments;

	nowTimestamp = Date.now();
	sinceTimestamp = (new Date(group.dataRetrievedAt || 0)).getTime();
	since =
		nowTimestamp - sinceTimestamp > cfg.fb.loadDataBehind
		? nowTimestamp - cfg.fb.loadDataBehind
		: sinceTimestamp;
	//since = nowTimestamp - 1000 * 60 * 60 * 24 * 5; // [rmelnyk] for test purposes only!
	since = Math.round(since / 1000);
	request.get(
			url + '?access_token=' + state.token +
			'&owner_id=' + -group.id +
			'&extended=1&count=20&scope=offline',
		function (err, response, body) {
		    vkQcb();
			body = jsonParse(body);
			if (body && body.error && body.error.type === 'OAuthException') {
				callback(true, 'auth-fail');
			} else if (body && body.error) {
			    $log('e', body.error.error_msg);
			} else if (body && body.response) {
				if (body.response.wall && body.response.wall.length > 0) {
				    body.response.wall.splice(0, 2);
				    var wallLength = body.response.wall.length;
				    for (var i = 0; i <= wallLength - 1; i++) {
				        if (body.response.wall[i] && body.response.wall[i].date < since) {
				            body.response.wall.splice(i, wallLength);
				            break;
				        }
				    }
				    if (body.response.wall.length > 0) {
				        async.map(
                            body.response.wall,
                            function (post, cb) {
                                if (post.comments && post.comments.count > 0) {
                                    vkQueue.add(function (vkQcb) {
                                        request.get(
                                        	commentsUrl + '?access_token=' + state.token +
                                        	'&scope=offline&owner_id=' + -group.id +
                                        	'&post_id=' + post.id,
                                        function (err, response, payload) {
                                            var payload = jsonParse(payload);
                                            if (err) {
                                                $log('e', 'failed to save the data from the feed page');
                                            } else {
                                                payload.response.length && payload.response.shift();
                                                post.comments.data = payload.response;
                                                vkQcb();
                                                cb(false);
                                            }
                                        });
                                    });
                                } else {
                                    cb(false);
                                }
                            },
                            function (err, _res) {
                                var dataArray = {
                                    payload: []
                                };
                                body.response.wall.forEach(function (post, index) {
                                    var data = {
                                    	url: url,
                                    	type: 'feed',
                                    	post: post,
                                    	date: Date.now(),
                                    	network: 'vk',
                                    	group: group
                                    };
                                    Data.findOneAndUpdate({'post.id': post.id, network: 'vk'}, data, { upsert: true }, function (err, item) {
                                        if (err) {
                                        	$log('e', 'failed to save the data from the feed page');
                                        	callback(true, null);
                                        } else {
                                            dataArray.payload.push(item);
                                            if (index === (body.response.wall.length - 1)) {
                                                $log('i', ''
                                                	+ 'group ' + group.name
                                                	+ '; found ' + body.response.wall.length + ' new items');
                                                group.dataRetrievedAt = new Date();
                                                callback(false, {group: group, data: dataArray});
                                            }
                                        }

                                    });
                                });
                            }
                        );
				    } else {
				        group.dataRetrievedAt = new Date();
                        callback(false, null);
				    }
				} else {
					// do not save empty results
					// $log('i', ''
					// 	+ 'group ' + group.name
					// 	+ '; nothing changed since ' + group.dataRetrievedAt.toString());
					group.dataRetrievedAt = new Date();
					callback(false, null);
				}
			} else {
				$log('e', 'the API returned the unknown data format' + body);
				callback(true, null);
			}
		});

	return true;
};
