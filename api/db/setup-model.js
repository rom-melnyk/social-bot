var mongoose = require('mongoose');

var GgroupSchema = new mongoose.Schema({
	id: mongoose.Schema.Types.Mixed,
	keywords: Array,
	dataRetrieved: Date
});

module.exports = mongoose.model('Setup', {
	network: String,					// one of "fb" or "vk"
	keywords: Array,
	groups: [GgroupSchema]
});
