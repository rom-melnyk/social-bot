var express = require('express'),
	app = express(),
	favicon = require('express-favicon'),
	handlers = {},
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	State = require('./api/db/state-model'),
	request = require('request'),
	http = require('http'),
	https = require('https'),
	os = require("os"),
	host,
    port;

var key = '1545533905707947',
    secret = 'fb006d64b0b84d17fd6f4b1964490138';
require('./api/db/connect');

// ------------ statics ------------
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(cookieParser());

// ------------ routes ------------
handlers.state = require('./api/state');
handlers.startStop = require('./api/start-stop');
handlers.setup = require('./api/setup');
handlers.rawData = require('./api/raw-data');
handlers.login = require('./api/login');
handlers.test = function (req, res) {
	res.status(200).send({
		requestBody: req.body,
		requestParams: req.params,
		requestQuery: req.query
	});
};


// ------------ login check ------------
app.use(/^\/api/, function (req, res, next) {
	// TODO remove the '/api/create-user' condition after implementing all the user functionality (profiles and so on)
	if ((req.path === '/login' || req.path === '/create-user') && req.method === 'POST') {
		next();
	} else {
		handlers.login.checkSessionCookie(req, res, next);
	}
});
var token;
var credentials = {
  clientID: key,
  clientSecret: secret,
  site: 'https://graph.facebook.com',
  tokenPath: '/oauth/access_token'
};

// Initialize the OAuth2 Library
var oauth2 = require('simple-oauth2')(credentials);

var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://social-monitoring.herokuapp.com/callback/',
  scope: 'public_profile, email',
  state: '3(#0/!~'
});

// Initial page redirecting to Github
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
    console.log('in auth');
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code,
    expires;
  console.log('/callback');
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://social-monitoring.herokuapp.com/callback/'
  }, function (error, result) {
    if (error) { console.log('Access Token Error', error.message); } else {
        token = result.split('=')[1].split('&')[0];
        expires = result.split('=')[2];
    }
    State.findOneAndUpdate({network: 'fb'}, {token: token, state: 'token-updated'}, function (err, result) {
        res.send(expires);
    });
  });
});



// ------------ statics ------------
app.use(express.static(__dirname + '/public'));
// ------------ API ------------
app.post('/api/login', handlers.login.loginUser);
app.get('/api/check-session', handlers.login.checkSession);
app.post('/api/create-user', handlers.login.createUser);
app.put('/api/create-user', handlers.login.updateUserInfo);
app.delete('/api/user/:id', handlers.login.removeUser);
app.get('/api/users', handlers.login.getUsers);

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
var server = app.listen(process.env.PORT || 3000, function () {
	host = server.address().address;
	port = server.address().port;

	console.log('The bot is running and listening the http://%s:%s', host, port);

});



