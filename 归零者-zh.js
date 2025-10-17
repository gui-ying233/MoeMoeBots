"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").mzh);
(async () => {
	await api.login();
	const edit = async () => {
		let r;
		try {
			r = await api.post({
				action: "edit",
				nocreate: true,
				tags: "Bot",
				bot: true,
				token: await api.getToken("csrf"),
				title: "Help:沙盒/json",
				text: '{"_addText":"{{沙盒顶部}}"}',
				summary:
					"沙盒清理作业，若想保留较长时间，可以在[[Special:我的用户页/Sandbox.json|个人测试区]]作测试，或者翻阅历史记录。",
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
				`https://zh.moegirl.org.cn/Special:Diff/${r.edit.oldrevid}/${r.edit.newrevid}`
			);
	};
	edit();
})();
