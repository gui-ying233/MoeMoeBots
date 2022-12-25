"use strict";

const { MediaWikiJS } = require("@lavgup/mediawiki.js");
const bot = new MediaWikiJS(require("./config.json").mzh);

const days = {
	1: 31,
	2: 28,
	3: 31,
	4: 30,
	5: 31,
	6: 30,
	7: 31,
	8: 31,
	9: 30,
	10: 31,
	11: 30,
	12: 31,
};
const today = new Date();
var key = "",
	value = "";

bot.login().then(async () => {
	for (var m = 6; m <= 12; m++) {
		for (var d = 1; d <= days[m]; d++) {
			if (m * 100 + d < (today.getMonth() + 1) * 100 + today.getDate()) {
				console.log(String(m).padStart(2, 0), String(d).padStart(2, 0));
				try {
					const result0 = await bot.api.get({
						action: "query",
						format: "json",
						list: "usercontribs",
						uclimit: "max",
						ucstart: `2022-${String(m).padStart(2, 0)}-${String(
							d
						).padStart(2, 0)}T16:00:00.000Z`,
						ucend: `${
							d - 1 == 0
								? `2022-${String(m - 1).padStart(
										2,
										0
								  )}-${String(days[m - 1]).padStart(
										2,
										0
								  )}T16:00:00.000Z`
								: `2022-${String(m).padStart(2, 0)}-${String(
										d - 1
								  ).padStart(2, 0)}T16:00:00.000Z`
						}`,
						ucuser: "鬼影233",
						ucprop: "",
					});
					key += `\n"2022年${m}月${d}日",`;
					value += `\n{\n\t"value": ${result0.query.usercontribs.length}\n},`;
				} catch (e0) {
					console.error(e0);
				}
			}
		}
	}
	console.info(key);
	console.info(value);
});
