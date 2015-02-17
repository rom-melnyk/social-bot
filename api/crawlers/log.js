module.exports = function (ntw) {
	return function (level, msg) {
		var _lvl,
			_crwlr = ntw.toUpperCase();

		switch (level) {
			case 'i': _lvl = 'i'; break;
			case 'w': _lvl = 'warn'; break;
			case 'e': _lvl = 'ERR'; break;
			default: _lvl = 'i';
		}
		console.log('[ ' + _lvl + ' ] ' + (new Date()).toString() + ' [ ' + _crwlr + ' crawler ]: ' + msg);
	}
};
