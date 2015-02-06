var request = require('request'),
	CFG = require('./config');

/**
 * @path /api/me
 * Must be the function that accepts two params for the `request` and the `response`.
 */
module.exports = function (req, res) {
	var url = CFG.fb.apiHost + '/me';
	request(url, function (error, response, body) {
		var obj = {
			error: error,
			response: response,
			body: body
		};
		res.send(obj);
	});
};
