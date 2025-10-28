"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").mzh);

(async () => {
	await api.login();
	const pages = await api.post({
		action: "query",
		prop: "links",
		titles: "User talk:鬼影233/唱唱反调",
		plnamespace: "3|2",
		pllimit: "max",
	});
	console.log(`共${pages.query.pages[0].links.length}个页面。`);
	const edit = async title => {
		try {
			const r = await api.post({
				action: "edit",
				title,
				appendtext:
					'\n\n{{safesubst:U:鬼影233/唱唱反调}}<span style="display:none;">{{mute|{{safesubst:ROOTPAGENAME}}}} 《关于处理萌娘百科管理层向编辑滥用职权行为的公告》~~~</span>',
				summary: "速记羽毛笔：新一期的《唱唱反调》已送达，请注意查收~",
				tags: "Bot",
				bot: true,
				nocreate: true,
				token: await api.getToken("csrf"),
			});
			if (r?.error?.code === "badtoken") {
				console.warn("badtoken");
				await api.getToken("csrf", true);
				return await edit(title);
			}
			console.log(r.edit);
		} catch (e) {
			console.error(e);
		}
	};
	for (let i = 1; i < pages.query.pages[0].links.length; i++) {
		console.log(
			`第${i + 1}个页面：${pages.query.pages[0].links[i].title}。`
		);
		await edit(pages.query.pages[0].links[i].title);
	}
})();
