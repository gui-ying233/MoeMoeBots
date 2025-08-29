const { mw } = require("./mediaWiki");
const { writeFile } = require("fs/promises");

const srsearch = "insource:'sortableTableAnimation'";

(async () => {
	const data = { srsearch, pages: [] };
	const wikis = new Set(
		(
			await new mw.Api({
				url: "https://wiki.biligame.com/wiki/api.php",
			}).get({
				action: "parse",
				text: "{{#ask:[[分类:游戏WIKI]]|?WIKI域名|link=none|headers=hide|format=plainlist|limit=1000|searchlabel=}}, {{#ask:[[分类:游戏WIKI]]|?WIKI域名|link=none|headers=hide|format=plainlist|limit=1000|searchlabel=|offset=1001}}, {{#ask:[[分类:游戏WIKI]]|?WIKI域名|link=none|headers=hide|format=plainlist|limit=1000|searchlabel=|offset=2001}}",
				prop: "text",
				wrapoutputclass: "",
				disablelimitreport: true,
				disableeditsection: true,
				disabletoc: true,
				contentmodel: "wikitext",
			})
		).parse.text
			.slice(3, -4)
			.split(", ")
			.map(d => d.trim().replace(/^.+（\s*([0-9a-zA-Z]+?)\s*）$/s, "$1"))
			.filter(Boolean)
	)
		.add("tools")
		.add("wiki");
	for (const wiki of wikis) {
		let sroffset = 0;
		try {
			do {
				const r = await new mw.Api({
					url: `https://wiki.biligame.com/${wiki}/api.php`,
				}).get({
					action: "query",
					format: "json",
					list: "search",
					srsearch,
					srnamespace: "*",
					srlimit: "max",
					sroffset,
					srinfo: "",
					srprop: "",
				});
				data.pages.push(
					...r.query.search.map(d => (d.wiki = wiki) && d)
				);
				r.query.search.length && console.table(data.pages);
				sroffset = r?.continue?.sroffset;
			} while (sroffset);
		} catch {
			console.error(wiki);
		} finally {
			await writeFile("搜寻者.json", JSON.stringify(data, null, "\t"));
		}
	}
})();
