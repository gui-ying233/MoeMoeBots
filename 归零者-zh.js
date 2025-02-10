"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").zh);
(async () => {
	await api.login();
	const edit = async page => {
		let r;
		try {
			r = await api.post({
				action: "edit",
				nocreate: true,
				tags: "Bot",
				bot: true,
				token: await api.getToken("csrf", true),
				...page,
			});
			if (r?.error?.code === "badtoken") return edit(page);
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
	[
		{
			title: "模块:Sandbox/test",
			text: "",
			summary:
				"沙盒清理作业，若想保留较长时间，可以在个人测试区作测试，或者翻阅历史记录。",
		},
		{
			title: "Help:沙盒/json",
			text: '{"warning":"请删除此行"}',
			summary:
				"沙盒清理作业，若想保留较长时间，可以在[[Special:我的用户页/Sandbox/json|个人测试区]]作测试，或者翻阅历史记录。",
		},
	].forEach(edit);
})();
