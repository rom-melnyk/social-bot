var cfg = require('../config'),
	mongoose = require('mongoose');

var dbUrl = 'mongodb://' + cfg.db.host + '/' + cfg.db.name;
console.log(dbUrl);
mongoose.connect(dbUrl);

mongoose.connection.on('error', function () {
	throw new Error('Database connection failed');
});

module.exports = true;