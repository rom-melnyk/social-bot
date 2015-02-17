/**
 * @private
 * @param {String} str
 * @return {Object|null}
 */
module.exports = function (str) {
	var ret;
	try {
		ret = JSON.parse(str);
	} catch (e) {
		ret = null;
	}
	return ret;
};

