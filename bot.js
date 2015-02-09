var express = require('express'),
	app = express(),
	favicon = require('express-favicon'),
	handlers = {},
	bodyParser = require('body-parser');

// ------------ statics ------------
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// ------------ routes ------------
handlers.me = require('./api/test-me');
app.get('/api/me', handlers.me);

// catch errors (404, 500) and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send({
		message: err.message,
		error: err
	});
});

// ------------ the server itself ------------
var server = app.listen(3000, function () {
	var host = server.address().address,
		port = server.address().port;

	console.log('The bot is running and listening the http://%s:%s', host, port);

});

