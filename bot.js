var express = require('express'),
	app = express(),
	favicon = require('express-favicon'),
	handlers = {},
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	login = require('./api/login');

require('./api/db/connect');

// ------------ statics ------------
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(cookieParser());
// ------------ login check ------------
app.use(/^\/api/, function (req, res, next) {
	// TODO remove the '/api/create-user' condition after implementing all the user functionality (profiles and so on)
	if ((req.path === '/login' || req.path === '/create-user') && req.method === 'POST') {
		next();
	} else {
		login.checkSessionCookie(req, res, next);
	}
});

// ------------ routes ------------
handlers.state = require('./api/state');
handlers.startStop = require('./api/start-stop');
handlers.setup = require('./api/setup');
handlers.rawData = require('./api/raw-data');
handlers.test = function (req, res) {
	res.status(200).send({
		requestBody: req.body,
		requestParams: req.params,
		requestQuery: req.query
	});
};

// ------------ statics ------------
app.use(express.static(__dirname + '/public'));

app.post('/api/login', login.loginUser);
app.get('/api/check-session', login.checkSession);
app.post('/api/create-user', login.createUser);

app.get('/api/state/:network', handlers.state.check);
app.put('/api/state/:network', handlers.state.save);

app.get('/api/start/:network', handlers.startStop.start);
app.get('/api/stop/:network', handlers.startStop.stop);

app.get('/api/setup/:network', handlers.setup.getAllGroups);
app.put('/api/setup/:network', handlers.setup.updateAllGroups);
app.post('/api/setup/:network', handlers.setup.createGroup);
app.put('/api/setup/:network/keywords', handlers.setup.updateNetworkKeywords);
// for internal purposes only!
app.get('/api/setup/:network/reset-dates', handlers.setup.resetDates);

app.get('/api/setup/:network/:gid', handlers.setup.getGroup);
app.put('/api/setup/:network/:gid', handlers.setup.updateGroup);
app.delete('/api/setup/:network/:gid', handlers.setup.deleteGroup);

app.get('/api/data/:network/raw', handlers.rawData.getRawData);
app.get('/api/data/:network/analyzed', handlers.rawData.getAnalyzedData);

// for test purposes
app.all('/api/test', handlers.test);
app.all("/login", function(req, res, next) {
    res.sendfile("index.html", { root: __dirname  + '/public'});
});
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
var server = app.listen(process.env.PORT || 3001, function () {
	var host = server.address().address,
		port = server.address().port;

	console.log('The bot is running and listening the http://%s:%s', host, port);

});

