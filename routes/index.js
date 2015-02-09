var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title: 'Express'
	});
});
router.post('/', function(req, res) {
	console.log(req.form);

	res.render('index', {
		title: 'Express'
	});
});
module.exports = router;