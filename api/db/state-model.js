var mongoose = require('mongoose');

module.exports = mongoose.model('State', {
	state: String,					// one of "auth-fail", "token-updated", "running", "stopped"
	stateUpdatedAt: Date,
	token: String,					// the auth token
	tokenUpdatedAt: Date,
	network: String					// one of "fb" or "vk"
});
