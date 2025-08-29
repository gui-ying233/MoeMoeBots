"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").en);
(async () => {
	await api.login();
	const edit = async title => {
		let r;
		try {
			r = await api.post({
				action: "edit",
				text: "<noinclude>{{Sandbox heading}}</noinclude>\n== Please test below ==<!--DO NOT DELETE NOR CHANGE ANYTHING ABOVE THIS LINE, INCLUDING THIS LINE!-->",
				summary: "Clearing the sandbox",
				nocreate: true,
				tags: "Bot",
				bot: true,
				token: await api.getToken("csrf"),
				title,
			});
			if (r?.error?.code === "badtoken") {
				console.warn("badtoken");
				await api.getToken("csrf", true);
				return await edit(title);
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
	["Help:Sandbox", "Template:Sandbox"].forEach(edit);
})();
