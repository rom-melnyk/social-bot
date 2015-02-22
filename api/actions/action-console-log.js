/**
 * 1) The Crawled retrieves some data;
 * 2) Feeds it to the Analyzer;
 * 3) If a keyword (any of network-level or group-level ones) is found, the Action (or several Actions) is/are invoked.
 *
 * The Action must be the function consuming the two params (both Objects):
 * - the first one contains the info about the network, group and so on,
 * - the second one is the data bunch that me the keyword condition.
 *
 * This is a sample one.
 *
 * @param {Object} cfg                  the network, the group, keywords and so on
 * @param {Object} payload              will be provided by the Analyser
 */
module.exports = function (cfg, payload) {
	console.log('\n');
	console.log('------ <%s / %s> ------', cfg.network.toUpperCase(), cfg.group.name);
	console.log(payload);
	console.log('-----------------------------------------');
};
