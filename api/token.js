var request = require('request'),
	CFG = require('./config'),
	mongoose = require('mongoose');

var dbUrl = 'mongodb://' + CFG.db.host + '/' + CFG.db.name;
mongoose.connect(dbUrl);

var Token = mongoose.model('Token', {
	/**
	 * @cfg {String} key				the token itself
	 */
	token: String,
	/**
	 * @cfg {String} social				one of "fb" or "vk"
	 */
	social: String,
	/**
	 * @cfg {Date} date					creation date
	 */
	date: Date
});

module.exports = {
	/**
	 * @method GET
	 * @path /api/token
	 * Must be the function that accepts two params for the `request` and the `response`.
	 */
	check: function (req, res, next) {
		Token.find(function (err, tokens) {
			if (err) {
				var error = new Error('Database error, failed to find the token');
				next(error);
			} else {
				res.status(200).send({
					social: tokens[0] && tokens[0].social || '',
					token: tokens[0] && tokens[0].key || '',
					date: tokens[0] && tokens[0].date || ''
				});
			}
		});
	},

	/**
	 * @method PUT
	 * @path /api/token
	 * Saves the token
	 */
	save: function (req, res, next) {
		var _t = req.body.token || '',
			token = new Token({
				key: _t,
				social: 'fb',
				date: Date.now()
			});
		token.save(function (err) {
			if (err) {
				var error = new Error('Database error, failed to save the token');
				next(error);
			} else {
				res.status(200).send({
					token: _t
				});
			}
		})
	}
};
/*

	function (req, res) {
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
*/
