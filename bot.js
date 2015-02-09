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
handlers.token = require('./api/token');
handlers.test = function (req, res) {
	res.status(200).send({
		requestBody: req.body,
		requestParams: req.params,
		requestQuery: req.query
	});
};
app.get('/api/me', handlers.me);
app.get('/api/token', handlers.token.check);
app.put('/api/token', handlers.token.save);
// for test purposes
app.get('/api/test', handlers.test);
app.post('/api/test', handlers.test);
app.put('/api/test', handlers.test);
app.delete('/api/test', handlers.test);

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

