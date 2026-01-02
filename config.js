const {
	env: {
		MOEGIRL_ZH_BOTUSERNAME,
		MOEGIRL_ZH_BOTPASSWORD,
		MOEGIRL_CM_BOTUSERNAME,
		MOEGIRL_CM_BOTPASSWORD,
		MOEGIRL_EN_BOTUSERNAME,
		MOEGIRL_EN_BOTPASSWORD,
		MOEGIRL_JA_BOTUSERNAME,
		MOEGIRL_JA_BOTPASSWORD,
		MOEGIRL_LIBRARY_BOTUSERNAME,
		MOEGIRL_LIBRARY_BOTPASSWORD,
		MOEGIRL_MOEGIRLSSOUSERID,
		MOEGIRL_MOEGIRLSSOTOKEN,
		MOEGIRL_UK_BOTUSERNAME,
		MOEGIRL_UK_BOTPASSWORD,
		MOEGIRL_ICU_BOTUSERNAME,
		MOEGIRL_ICU_BOTPASSWORD,
		PRTS_BOTUSERNAME,
		PRTS_BOTPASSWORD,
		BWIKI_SESSDATA,
	},
} = process;
module.exports = {
	zh: {
		api: "https://zh.moegirl.org.cn/api.php",
		rest: "https://zh.moegirl.org.cn/rest.php/v1/",
		botUsername: MOEGIRL_ZH_BOTUSERNAME,
		botPassword: MOEGIRL_ZH_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	mzh: {
		api: "https://mzh.moegirl.org.cn/api.php",
		rest: "https://mzh.moegirl.org.cn/rest.php/v1/",
		botUsername: MOEGIRL_ZH_BOTUSERNAME,
		botPassword: MOEGIRL_ZH_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	mobile: {
		api: "https://mobile.moegirl.org.cn/api.php",
		rest: "https://mobile.moegirl.org.cn/rest.php/v1/",
		botUsername: MOEGIRL_ZH_BOTUSERNAME,
		botPassword: MOEGIRL_ZH_BOTUSERNAME,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	cm: {
		api: "https://commons.moegirl.org.cn/api.php",
		rest: "https://commons.moegirl.org.cn/rest.php/v1/",
		botUsername: MOEGIRL_CM_BOTUSERNAME,
		botPassword: MOEGIRL_CM_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	en: {
		api: "https://en.moegirl.org.cn/api.php",
		rest: "https://en.moegirl.org.cn/rest.php/v1/",
		botUsername: MOEGIRL_EN_BOTUSERNAME,
		botPassword: MOEGIRL_EN_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	ja: {
		api: "https://ja.moegirl.org.cn/api.php",
		rest: "https://ja.moegirl.org.cn/rest.php/v1/",
		botUsername: MOEGIRL_JA_BOTUSERNAME,
		botPassword: MOEGIRL_JA_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	library: {
		api: "https://library.moegirl.org.cn/api.php",
		rest: "https://library.moegirl.org.cn/rest.php/v1/",
		botUsername: MOEGIRL_LIBRARY_BOTUSERNAME,
		botPassword: MOEGIRL_LIBRARY_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	uk: {
		api: "https://moegirl.uk/api.php",
		rest: "https://moegirl.uk/rest.php/v1/",
		botUsername: MOEGIRL_UK_BOTUSERNAME,
		botPassword: MOEGIRL_UK_BOTPASSWORD,
	},
	icu: {
		api: "https://moegirl.icu/api.php",
		rest: "https://moegirl.icu/rest.php/v1/",
		botUsername: MOEGIRL_ICU_BOTUSERNAME,
		botPassword: MOEGIRL_ICU_BOTPASSWORD,
	},
	prts: {
		api: "https://prts.wiki/api.php",
		rest: "https://prts.wiki/rest.php/v1/",
		botUsername: PRTS_BOTUSERNAME,
		botPassword: PRTS_BOTPASSWORD,
	},
	/**
	 * @param {string} wiki
	 * @returns { { api: URL["href"]; rest: URL["href"]; cookie:{ SESSDATA: string } } }
	 */
	bwiki: wiki => {
		return {
			api: `https://wiki.biligame.com/${wiki}/api.php`,
			rest: `https://wiki.biligame.com/${wiki}/rest.php/v1/`,
			cookie: {
				SESSDATA: BWIKI_SESSDATA,
			},
		};
	},
};
