var express = require('express'),
	app = express();

app.use(express.static(__dirname + '/public'));

// ------------ routes ------------
app.get('/', function (req, res) {
	res.send('The bot is running');
});

// ------------ the server itself ------------
var server = app.listen(3000, function () {
	var host = server.address().address,
		port = server.address().port;

	console.log('The bot is running and listening the http://%s:%s', host, port);

});

