var express = require('express'),
	app = express(),
	favicon = require('express-favicon'),
	handlers = {};

// ------------ statics ------------
app.use(favicon(__dirname + '/public/gfx/favicon.ico'));
app.use(express.static(__dirname + '/public'));

handlers.me = require('./api/test-me');

// ------------ routes ------------
app.get('/api/me', handlers.me);

// ------------ the server itself ------------
var server = app.listen(3000, function () {
	var host = server.address().address,
		port = server.address().port;

	console.log('The bot is running and listening the http://%s:%s', host, port);

});

