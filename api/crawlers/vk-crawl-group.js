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
			'&extended=1',
		function (err, response, body) {
		    vkQcb();
			body = jsonParse(body);
			if (body && body.error && body.error.type === 'OAuthException') {
				callback(true, 'auth-fail');
			} else if (body && body.error) {
			    $log('e', body.error.error_msg);
			} else if (body && body.response) {
				if (body.response.wall && body.response.wall.length > 0) {
				    var wallLength = body.response.wall.length;
				    for (var i = wallLength - 1; i >= 0; i--) {
				        console.log(body.response.wall[i].date - since);
				        if (body.response.wall[i] && body.response.wall[i].date < since) {
				            body.response.wall.splice(0, i + 1);
				            console.log('removed ' + i);
				            break;
				        }
				    }
				    console.log('length ' + body.response.wall.length);
				    if (body.response.wall.length > 0) {
				        async.map(
                            body.response.wall,
                            function (post, cb) {
                                if (post.comments && post.comments.count > 0) {
                                    vkQueue.add(function (vkQcb) {
                                        request.get(
                                        	commentsUrl + '?access_token=' + state.token +
                                        	'&owner_id=' + -group.id +
                                        	'&post_id=' + post.id,
                                        function (err, response, payload) {
                                            var payload = jsonParse(payload);
                                            if (err) {
                                                $log('e', 'failed to save the data from the feed page');
                                            } else {
                                                $log('i', ''
                                                + 'group ' + group.name
                                                + '; found ' + payload.response + 'comments');
                                                payload.response.length && payload.response.shift();
                                                post.comments.data = payload.response;
                                                vkQcb();
                                                cb(false);
                                            }
                                        });
                                    });
                                } else {
                                    $log('i', ''
                                    + 'post: ' + post.id
                                    + ' comments not found');
                                    cb(false);
                                }
                            },
                            function (err, _res) {
                                var data = new Data({
                                	url: url,
                                	type: 'feed',
                                	payload: body.response.wall,
                                	date: Date.now(),
                                	network: 'vk',
                                	group: group
                                });
                                data.save(function (err, data) {
                                	if (err) {
                                		$log('e', 'failed to save the data from the feed page');
                                		callback(true, null);
                                	} else {
                                		$log('i', ''
                                			+ 'group ' + group.name
                                			+ '; found ' + body.response.wall.length + ' new items');
                                		group.dataRetrievedAt = new Date();
                                		callback(false, {group: group, data: data});
                                	}
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
