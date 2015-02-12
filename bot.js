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
handlers.state = require('./api/state');
handlers.startStop = require('./api/start-stop');
handlers.setup = require('./api/setup');
handlers.test = function (req, res) {
	res.status(200).send({
		requestBody: req.body,
		requestParams: req.params,
		requestQuery: req.query
	});
};

app.get('/api/state/:network', handlers.state.check);
app.put('/api/state/:network', handlers.state.save);

app.get('/api/start/:network', handlers.startStop.start);
app.get('/api/stop/:network', handlers.startStop.stop);

app.get('/api/setup/:network', handlers.setup.getAllGroups);
// app.post('/api/setup/:network', handlers.setup.createGroup);
// app.get('/api/setup/:network/:gid', handlers.setup.getGroup);
// app.put('/api/setup/:network/:gid', handlers.setup.updateGroup);
// app.delete('/api/setup/:network/:gid', handlers.setup.deleteGroup);

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

