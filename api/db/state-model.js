var mongoose = require('mongoose');

module.exports = mongoose.model('State', {
	state: String,					// one of "auth-fail", "token-updated", "running"
	token: String,					// the auth token
	tokenDate: Date,
	successfulDataRetrievalDate: Date,
	network: String					// one of "fb" or "vk"
});
