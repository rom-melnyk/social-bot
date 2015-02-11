var cfg = require('../config').
	mongoose = require('mongoose'),
	State = require('../db/state-model');

var dbUrl = 'mongodb://' + cfg.db.host + '/' + cfg.db.name;
mongoose.connect(dbUrl);

var crawler = function () {
	State.findOne({network: 'fb'}, function (err, state) {
		
	});
};

setInterval(crawler, 1000);