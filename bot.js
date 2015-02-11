var express = require('express'),
	app = express(),
	favicon = require('express-favicon'),
	handlers = {},
	bodyParser = require('body-parser');

require('./api/db/connect');

// ------------ statics ------------
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// ------------ routes ------------
handlers.me = require('./api/test-me');
handlers.token = require('./api/token');
handlers.startStop = require('./api/start-stop');
handlers.test = function (req, res) {
	res.status(200).send({
		requestBody: req.body,
		requestParams: req.params,
		requestQuery: req.query
	});
};

app.get('/api/me', handlers.me);
app.get('/api/token/:network', handlers.token.check);
app.put('/api/token/:network', handlers.token.save);
app.get('/api/start/:network', handlers.startStop.start);
app.get('/api/stop/:network', handlers.startStop.stop);
// for test purposes
app.all('/api/test', handlers.test);

// ------------ routes - errors ------------
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

