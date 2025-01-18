const {
	env: {
		MOEGIRL_ZH_BOTUSERNAME,
		MOEGIRL_ZH_BOTPASSWORD,
		MOEGIRL_MZH_BOTUSERNAME,
		MOEGIRL_MZH_BOTPASSWORD,
		MOEGIRL_CM_BOTUSERNAME,
		MOEGIRL_CM_BOTPASSWORD,
		MOEGIRL_MOEGIRLSSOUSERID,
		MOEGIRL_MOEGIRLSSOTOKEN,
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
		botUsername: MOEGIRL_MZH_BOTUSERNAME,
		botPassword: MOEGIRL_MZH_BOTPASSWORD,
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
};
