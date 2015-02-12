var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
	id: String,
	name: String,
	description: String,
	keywords: Array,
	dataRetrievedAt: Date
});

module.exports = {
	setup: mongoose.model('Setup', {
		network: String,					// one of "fb" or "vk"
		keywords: Array,
		groups: [GroupSchema]
	}),
	group: GroupSchema
};
