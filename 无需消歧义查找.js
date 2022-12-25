"use strict";

const { MediaWikiJS } = require("@lavgup/mediawiki.js");
const bot = new MediaWikiJS(require("./config.json").mzh);
bot.login().then(async () => {
	try {
		const result0 = await bot.api.get({
			action: "query",
			geicontinue: "0|492850",
			generator: "embeddedin",
			geititle: "T:标题格式化",
			geilimit: "max",
			geinamespace: "0",
		});
		for (let i = 0; i < result0.query.pages.length; i++) {
			console.log(
				`第${i + 1}/${result0.query.pages.length}个页面：${
					result0.query.pages[i].title
				}`
			);
			if (
				result0.query.pages[i].title.match(":") === null &&
				result0.query.pages[i].title.match("/") === null
			) {
				try {
					const result1 = await bot.api.get({
						action: "query",
						prop: "info",
						titles: result0.query.pages[i].title.replace(
							/^(.+)\(.+?\)$/g,
							"$1"
						),
					});
					if (result1.query.pages[0].missing) {
						console.info(
							`${result0.query.pages[i].title}=>${result1.query.pages[0].title}`
						);
					}
				} catch (e1) {
					console.error(e1);
				}
			}
		}
		console.info(result0.continue.geicontinue);
	} catch (e0) {
		console.error(e0);
	}
});
