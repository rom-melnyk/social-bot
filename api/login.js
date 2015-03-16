var crypto = require('crypto'),
	CFG = require('./config'),
	User = require('./db/user-model');
	/*phantom = require('phantom');
var key = '1545533905707947';
var secret = 'fb006d64b0b84d17fd6f4b1964490138';
var user = 'botsawyer@gmail.com';
var password = 'Simplepass123';
var oauth = require('oauth');*/
var errHandler = function (msg, status, callback) {
	var err = new Error(msg);
	err.status = status || 500;
	callback(err);
};

/*this.OAuth = new oauth.OAuth2(key, secret, 'https://graph.facebook.com/', null, 'oauth/access_token?redirect_uri=http://localhost:3000/auth', null);
this.OAuth.getOAuthAccessToken(
  '1545533905707947|HnX8ErqROPkCTQXP2awA7kJ0sSE',
  {'grant_type':'client_credentials'},
  function (e, access_token, refresh_token, results){
  *//*if (callback) {
    callback(err, {access_token: access_token, access_token_secret: refresh_token});
  }
  else {
    if (err) {
      winston.error("Auto OAuth authentication process failed");
      winston.error(util.inspect(err, {showHidden: true, depth: 7}));
    }
    else {
      winston.info('access_token=' + access_token + ',access_token_secret=' + access_token_secret);
    }
  }*//*
});*/



var md5 = function (txt) {
    var hash = crypto.createHash('md5');
    hash.update(txt);
    return hash.digest('hex');
};

var str2hex = function (str) {
	var ret = '';

	for (var i = 0; i < str.length; i++) {
		ret += str.charCodeAt(i).toString(16);
	}
	return ret;
};

var hex2str = function (hex) {
	var ret = '';

	for (var i = 0; i < hex.length; i+=2) {
		ret += String.fromCharCode(
			parseInt(hex.substr(i, 2), 16)
		);
	}
	return ret;
};

/**
 * @return {String}					a random chars sequence
 */
var createSalt = function () {
	var ret = '';
	for (var i = 0; i < 5; i++) {
		// ASCII codes in range [33..126]
		ret += String.fromCharCode(Math.floor(Math.random() * 93) + 33);
	}
	return ret;
};

/**
 * Encodes the password for storing in the database.
 * @return {String}
 */
var createPasswordHash = function (password, salt) {
	return md5(password + '-/-' + salt);
};

/**
 * @param {String} login
 * @param {String} password
 * @param {Number} [timestamp=undefined]
 * @return {String}
 */
var createSessionCookie = function (login, password, timestamp) {
    var date = timestamp ? (new Date(timestamp)).getTime() : +Date.now();

    return md5(password + '-/-' + date) + date.toString(16) + str2hex(login);
};

/**
 * @method *
 * @url *
 * @request-cookies {String} [CFG.user.sessionCookieName]
 * Verifies the session cookie; if wrong/missed --> responses with the error object;
 * otherwise updates the cookie and passes the router further.
 */
var checkSessionCookie = function (req, res, next) {
    var cookie = req.cookies[CFG.user.sessionCookieName],
		timestamp, login;

	var sendErrorResponse = function () {
		res.cookie(CFG.user.sessionCookieName, '', {maxAge: -100000});
		errHandler('Not logged in', 599, next);
	};

	if (typeof cookie !== 'string' || cookie.length < 45) {
		sendErrorResponse();
		return;
	}

    timestamp = parseInt(cookie.substring(32, 43), 16);
    if (!timestamp || Date.now() - timestamp > CFG.user.sessionDuration) {
		sendErrorResponse();
        return;
    }

	login = hex2str(cookie.substring(43, cookie.length));
	User.findOne({login: login}, function (err, user) {
		if (err) {
			console.log('[ ERR ] Failed to retrieve the user info');
			sendErrorResponse();
			return;
		}

		if (!user) {
			sendErrorResponse();
			return;
		}

		if (createSessionCookie(user.login, user.password, timestamp) !== cookie) {
			sendErrorResponse();
		} else {
			res.cookie(
				CFG.user.sessionCookieName,
				createSessionCookie(user.login, user.password),
				{path: '/', maxAge: CFG.user.sessionDuration}
			);
			next();
		}
	});
};

/**
 * @method POST
 * @url /api/create-user
 * @request-body {Object} must contain String fields "login", "password", "name"
 * @response {JSON}
 */
var createUser = function (req, res, next) {
	if (!req.body.login || !req.body.password || !req.body.name) {
		errHandler('Request error, at least one of "login", "password" or "name" parameters was not found', 590, next);
		return;
	}

	User.findOne({login: req.body.login}, function (err, _usr) {
		if (err) {
			errHandler('Database error, failed to retrieve the user info', 591, next);
		} else if (_usr) {
			errHandler('Request error, user already exists', 590, next);
		} else {
			var salt = createSalt(),
				user = new User({
					login: req.body.login,
					salt: salt,
					password: createPasswordHash(req.body.password, salt),
					name: req.body.name,
					email: req.body.email,
					keywords: req.body.keywords,
					receiveMails: req.body.receiveMails
				});

			user.save(function (err) {
				if (err) {
					errHandler('Database error, failed to create the new user', 591, next);
				} else {
					res.send({
						success: true,
						user: {
							id: req.body.id,
							name: req.body.name,
							email: req.body.email,
							keywords: req.body.keywords,
							receiveMails: req.body.receiveMails
						}
					});
				}
			});
		}
	});
};

/**
 * @method DELETE
 * @url /api/user/:userId
 * @response {JSON}
 */
var removeUser = function (req, res, next) {
	if (!req.params.id) {
		errHandler('Request error, there is no user id provided', 590, next);
		return;
	}

	User.remove({_id: req.params.id}, function (err, _usr) {
		if (err) {
			errHandler('Database error, failed to retrieve the user info', 591, next);
		} else {
			res.send({
				removed: true
			});
		}
	});
};

/**
 * @method PUT
 * @url /api/login
 * @request-body {Object} must contain String field "id"
 * @response {JSON}
 * @response-cookie [CFG.user.sessionCookieName]			is set if success
 */
var updateUserInfo = function (req, res, next) {
	if (!req.body.id) {
		errHandler('Request error, both "login" and "password" parameters must be present', 590, next);
		return;
	}

	User.findOneAndUpdate({_id: req.body.id}, req.body, function (err, user) {
		if (err) {
			errHandler('Database error, failed to retrieve the user info', 591, next);
		} else if (!user) {
			errHandler('Request error, user not found', 590, next);
		} else {
		res.cookie(
			CFG.user.sessionCookieName,
			createSessionCookie(user.login, user.password),
			{path: '/', maxAge: CFG.user.sessionDuration}
		);
		res.send({
			name: user.name,
			email: user.email,
			id: user.id,
			keywords: user.keywords,
			receiveMails: user.receiveMails
		});
		}
	});
};

/**
 * @method POST
 * @url /api/login
 * @request-body {Object} must contain String fields "login", "password"
 * @response {JSON}
 * @response-cookie [CFG.user.sessionCookieName]			is set if success
 */
var loginUser = function (req, res, next) {
	if (!req.body.login || !req.body.password) {
		errHandler('Request error, both "login" and "password" parameters must be present', 590, next);
		return;
	}

	User.findOne({login: req.body.login}, function (err, user) {
		if (err) {
			res.cookie(CFG.user.sessionCookieName, '', {maxAge: -100000});
			errHandler('Database error, failed to retrieve the user info', 591, next);
		} else if (!user) {
			res.cookie(CFG.user.sessionCookieName, '', {maxAge: -100000});
			errHandler('Request error, user not found', 590, next);
		} else {
			if (user.password !== createPasswordHash(req.body.password, user.salt)) {
				res.cookie(CFG.user.sessionCookieName, '', {maxAge: -100000});
				errHandler('Request error, user/password don\'t match', 590, next);
			} else {
				res.cookie(
					CFG.user.sessionCookieName,
					createSessionCookie(user.login, user.password),
					{path: '/', maxAge: CFG.user.sessionDuration}
				);
				res.send({
					name: user.name,
					email: user.email,
					id: user.id,
					keywords: user.keywords,
					receiveMails: user.receiveMails
				});
			}
		}
	});
};
/**
 * @method GET
 * @url /api/users
 * @response {JSON}
 */
var getUsers = function (req, res, next) {
    var _users = [];
	User.find({}, function (err, users) {
		if (err) {
			errHandler('Database error, failed to retrieve the users info', 591, next);
		} else if (!users) {
			errHandler('Request error, users not found', 590, next);
		} else {
		    users.forEach(function (usr) {
            	_users.push({
            		id: usr.id,
            		name: usr.name,
            		email: usr.email,
            		keywords: usr.keywords
            	});
            });
		    res.send({
		    	users: _users
		    });
		}
	});
};

/**
 * @method GET
 * @url /api/check-session
 * @response {JSON}
 * This is dummy method; it always returns correct data.
 * The trick is, it won't be called at all if the session is out/incorrect due to routing setup.
 */
var checkSession = function (req, res, next) {
    var cookie = req.cookies[CFG.user.sessionCookieName], login;
    login = hex2str(cookie.substring(43, cookie.length));
    User.findOne({login: login}, function (err, user) {
    	if (err) {
    		console.log('[ ERR ] Failed to retrieve the user info');
    		return;
    	} else {
    	    res.send({
    	        name: user.name,
    	        email: user.email,
    	        id: user.id,
    	        keywords: user.keywords,
    	        receiveMails: user.receiveMails
    	    });
    	}

    });
};

module.exports = {
	createUser: createUser,
	updateUserInfo: updateUserInfo,
	removeUser: removeUser,
	checkSessionCookie: checkSessionCookie,
	loginUser: loginUser,
	checkSession: checkSession,
	getUsers: getUsers
};
