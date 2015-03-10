var cfg = require('../config'),
	mongoose = require('mongoose');

var dbUrl = 'mongodb://';
if (cfg.env === 'prod') {
	dbUrl += cfg.db.prod.user + ':' + cfg.db.prod.password + '@';
	dbUrl += cfg.db.prod.host + '/' + cfg.db.prod.name;
} else {
	dbUrl += cfg.db.dev.host + '/' + cfg.db.dev.name;
}

console.log('[ i ] Connecting to the %s database', cfg.env.toUpperCase());
/*
var opts = {};
if (cfg.db.user) {
    opts.user = cfg.db.user;
}
if (cfg.db.password) {
    opts.password = cfg.db.password;
}
*/
mongoose.connect(dbUrl);

mongoose.connection.on('error', function () {
	throw new Error('Database connection failed');
});

module.exports = true;
