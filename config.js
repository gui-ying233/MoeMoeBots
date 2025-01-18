const {
	env: {
		MOEGIRL_BOTUSERNAME,
		MOEGIRL_BOTPASSWORD,
		MOEGIRL_MOEGIRLSSOUSERID,
		MOEGIRL_MOEGIRLSSOTOKEN,
	},
} = process;
module.exports = {
	zh: {
		url: "https://zh.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_BOTUSERNAME,
		botPassword: MOEGIRL_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
	mzh: {
		url: "https://mzh.moegirl.org.cn/api.php",
		botUsername: MOEGIRL_BOTUSERNAME,
		botPassword: MOEGIRL_BOTPASSWORD,
		cookie: {
			moegirlSSOUserID: MOEGIRL_MOEGIRLSSOUSERID,
			moegirlSSOToken: MOEGIRL_MOEGIRLSSOTOKEN,
		},
	},
};
