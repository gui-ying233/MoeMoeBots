"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").ja);
(async () => {
	await api.login();
	const edit = async () => {
		let r;
		try {
			r = await api.post({
				action: "edit",
				text: "<noinclude>{{サンドボックス冒頭}}</noinclude>\n== ここから下に書き込んでください ==",
				summary: "砂場ならし",
				nocreate: true,
				tags: "Bot",
				bot: true,
				token: await api.getToken("csrf"),
				title: "ヘルプ:サンドボックス",
			});
			if (r?.error?.code === "badtoken") {
				console.warn("badtoken");
				await api.getToken("csrf", true);
				return await edit();
			}
		} catch (e) {
			return console.error(e);
		}
		if (!r) return;
		console.table(r.edit);
		if (r.edit.nochange !== true)
			console.info(
				`https://en.moegirl.org.cn/Special:Diff/${r.edit.oldrevid}/${r.edit.newrevid}`
			);
	};
	edit();
})();
