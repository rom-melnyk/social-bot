var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	login: String,
	name: String,								// the human-friendly user name
	salt: String,
	password: String							// see the /api/login.js#createPasswordHash
});
