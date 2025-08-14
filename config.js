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
		PRTS_BOTUSERNAME,
		PRTS_BOTPASSWORD,
	},
} = process;
module.exports = {
	zh: {
		url: "https://zh.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_ZH_BOTUSERNAME,
		botPassword: MOEGIRL_ZH_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	mzh: {
		url: "https://mzh.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_ZH_BOTUSERNAME,
		botPassword: MOEGIRL_ZH_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	mobile: {
		url: "https://mobile.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_ZH_BOTUSERNAME,
		botPassword: MOEGIRL_ZH_BOTUSERNAME,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	cm: {
		url: "https://commons.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_CM_BOTUSERNAME,
		botPassword: MOEGIRL_CM_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	en: {
		url: "https://en.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_EN_BOTUSERNAME,
		botPassword: MOEGIRL_EN_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	ja: {
		url: "https://ja.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_JA_BOTUSERNAME,
		botPassword: MOEGIRL_JA_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	library: {
		url: "https://library.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_LIBRARY_BOTUSERNAME,
		botPassword: MOEGIRL_LIBRARY_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	uk: {
		url: "https://moegirl.uk/api.php",
		botUsername: MOEGIRL_UK_BOTUSERNAME,
		botPassword: MOEGIRL_UK_BOTPASSWORD,
	},
	prts: {
		url: "https://prts.wiki/api.php",
		botUsername: PRTS_BOTUSERNAME,
		botPassword: PRTS_BOTPASSWORD,
	},
};
