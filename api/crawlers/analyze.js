var __isObject = function (obj) {
	return typeof obj === 'object' && obj.toString() === '[object Object]';
};

// actually, should be `__isNonEmptyArray` but who cares?
var __isArray = function (obj) {
	return typeof obj === 'object' && obj.toString() !== '[object Object]' && +obj.length;
};

var __grep = function (string, keywords) {
	var ret = [],
		RE;

	for (var i = 0; i < keywords.length; i++) {
		try {
		    var matchArray = [];
			RE = new RegExp(keywords[i], 'gi');
			matchArray = string.match(RE);
			if (matchArray && matchArray.length) {
			    ret = ret.concat(matchArray);
			}
		} catch (e) {}
	}
	return ret;
};

var __analyzeObj = function (obj, keywords, callback, parent) {
	if (typeof obj === 'string') {
	    var count = __grep(obj, keywords) && __grep(obj, keywords).length;
		if (count) {
			callback(parent, count);
		}
	} else if (__isObject(obj)) {
		// traversing the object
		for (var key in obj) {
		    if (key !== "group" && key !== 'from') {
			    __analyzeObj(obj[key], keywords, callback, obj);
		    }
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
