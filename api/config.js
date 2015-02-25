/**
 * The config file
 */
module.exports = {
	db: {
		host: 'ds039301.mongolab.com:39301',
		name: 'social-bot'
	},
	fb: {
		/**
		 * This path describes the URL syntax
		 */
		apiHost: 'https://graph.facebook.com',
		apiCommon: '/v2.2',
		apiMe: '/me',
		apiFeed: '/feed',

		/*groups: [
			303201976514746, // "Тепле ІТ середовище"
			413176182109914 // "LocalDev knowledge sharing"

		],*/
		/**
		 * @cfg {Number} pollInterval
		 * Sets the interval between two consequence polls (API calls).
		 * 5 sec is for the testing only; change it on the PROD!
		 */
		pollInterval: 5 * 1000,
		/**
		 * @cfg {Number} loadDataBehind
		 * If the bot was not running for a long time, how far ago should it grab the data at the first run?
		 */
		loadDataBehind: 1000 * 60 * 60 * 24 * 5 // 5 days
	},
	vk: {
	    apiHost: 'https://api.vk.com',
        apiFeed: '/method/wall.get',
        apiComments: '/method/wall.getComments',
        pollInterval: 360 * 10000
	}
};
