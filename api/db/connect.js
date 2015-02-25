var cfg = require('../config'),
	mongoose = require('mongoose');

var dbUrl = 'mongodb://' + cfg.db.host + '/' + cfg.db.name;
var opts = {};
if (cfg.db.user) {
    opts.user = cfg.db.user;
}
if (cfg.db.password) {
    opts.password = cfg.db.password;
}
mongoose.connect(dbUrl, opts);

mongoose.connection.on('error', function () {
	throw new Error('Database connection failed');
});

module.exports = true;