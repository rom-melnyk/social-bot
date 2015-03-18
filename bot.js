var express = require('express'),
	app = express(),
	favicon = require('express-favicon'),
	handlers = {},
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	State = require('./api/db/state-model'),
	request = require('request'),
var key = '1545533905707947';
var secret = 'fb006d64b0b84d17fd6f4b1964490138';
var user = 'botsawyer@gmail.com';
var password = 'Simplepass123';
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



/*var oauth2 = require('simple-oauth2')({
  clientID: key,
  clientSecret: secret,
  site: 'https://graph.facebook.com',
  tokenPath: '/oauth/access_token'
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback/',
  scope: 'notifications',
  state: '3(#0/!~'
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code;
  console.log('/callback');
  oauth2.authCode.getToken({
    code: "1545533905707947|HnX8ErqROPkCTQXP2awA7kJ0sSE",
    redirect_uri: 'http://localhost:3000/callback/'
  }, saveToken);

  function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = oauth2.accessToken.create(result);
  }
});
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});*/



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

/*var refreshToken = function () {
    State.findOne({network: 'fb'}, function (err, state) {
        if (err) {
        	errHandler('Database error, failed to retrieve the state', 591, next);
        } else {
            FB.api('https://graph.facebook.com/oauth/access_token?client_id=1545533905707947&client_secret=fb006d64b0b84d17fd6f4b1964490138&grant_type=fb_exchange_token&method=get&pretty=0&fb_exchange_token=CAAV9p6dwI6sBANwQywIIjNVhqZCjw8SrF7hvJDLGsBxSHqPy8SR2DGEwQvnMcCZAyQDMp83oIqWAkCY0PLxfE88jOpNCdMRkYhk07NCiy4ro3hHqBmZCyV8ZA0qYBTFue2ZBdrs5c138mniCDZBOdgUhTMl6V2tfZAEN0sUuTVZCJFbXIzG8WWqxcgOYIwLLzARtKlPSkhpNk00g8B1pfdm0', function (data) {
                state.state = 'token-updated';
                state.stateUpdatedAt = Date.now();
                state.token = data.access_token;
                state.tokenUpdatedAt = Date.now();
                state.save(function (err, state) {});
            });
        }
    });
};
setInterval(refreshToken, 1000);*/
// ------------ the server itself ------------
var server = app.listen(process.env.PORT || 3000, function () {
	var host = server.address().address,
		port = server.address().port;

	console.log('The bot is running and listening the http://%s:%s', host, port);

});

