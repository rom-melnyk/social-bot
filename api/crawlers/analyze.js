var __isObject = function (obj) {
	return typeof obj === 'object' && obj.toString() === '[object Object]';
};

// actually, should be `__isNonEmptyArray` but who cares?
var __isArray = function (obj) {
	return typeof obj === 'object' && obj.toString() !== '[object Object]' && +obj.length;
};

var __grep = function (string, keywords) {
	var ret = false,
		RE;

	for (var i = 0; i < keywords.length; i++) {
		try {
			RE = new RegExp(keywords[i], 'gi');
			ret = ret || RE.test(string);
			if (ret) {
				break;
			}
		} catch (e) {}
	}

	return ret;
};

var __analyzeObj = function (obj, keywords, callback, parent) {
	if (typeof obj === 'string') {
		if (__grep(obj, keywords)) {
			callback(parent);
		}
	} else if (__isObject(obj)) {
		// traversing the object
		for (var key in obj) {
			__analyzeObj(obj[key], keywords, callback, obj);
		}
	} else if (__isArray(obj)) {
		// traversing the array
		obj.forEach(function (item) {
			__analyzeObj(item, keywords, callback, obj);
		});
	} else {
		return false;
	}
};

/**
 * @param {Object} obj				the node object, {name: "...", description: "..."}
 * 									Might contain sub-objects.
 * @param {Array} keywords			String[]
 * @param {Function} callback		describes what to do with the object if any of keywords was met
 */
module.exports = function (obj, keywords, callback) {
	if (__isArray(keywords) && typeof callback === 'function') {
		__analyzeObj(obj, keywords, callback);
	}
};
