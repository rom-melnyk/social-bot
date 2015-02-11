/**
 * The config file
 */
module.exports = {
	db: {
		host: 'localhost',
		name: 'social-bot'
	},
	fb: {
		apiHost: 'https://graph.facebook.com',
		apiCommon: '/v2.2',
		apiMe: '/me',
		apiFeed: '/feed',

		groups: [
			303201976514746, // "Тепле ІТ середовище"
			413176182109914 // "LocalDev knowledge sharing"
		],
		pollInterval: 5 * 1000
	},
	vk: {}
};
