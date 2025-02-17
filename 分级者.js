const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").zh);
const WikiParser = require("wikiparser-node");
WikiParser.config = "moegirl";
WikiParser.i18n = "zh-hans";
const { JSDOM } = require("jsdom");
const encodingJapanese = require("encoding-japanese");

(async () => {
	await api.login();
	const {
		query: { categorymembers },
	} = await api.get({
		action: "query",
		list: "categorymembers",
		cmtitle: "Category:需要更新分级信息的游戏条目",
		cmnamespace: [0],
		cmtype: "page",
		cmlimit: "max",
	});
	await api.getToken("csrf", true);
	for (const { title } of categorymembers) {
		console.log(`页面：${title}`);
		const {
			curtimestamp,
			query: {
				pages: [
					{
						revisions: [{ timestamp, content }],
					},
				],
			},
		} = await api.get({
			action: "query",
			curtimestamp: 1,
			prop: "revisions",
			titles: title,
			rvprop: "content|timestamp",
			rvsection: 0,
			formatversion: "2",
		});
		const root = WikiParser.parse(content);
		const gameName = root
			.querySelector("parameter#原名 > parameter-value")
			.childNodes.filter(node => node.type === "text")[0]
			.data.trim();
		console.log(`原名：${gameName}`);
		let enName;
		const getEnName = async () => {
			if (!enName)
				enName = (
					await new mw.Api({
						url: "https://en.wikipedia.org/w/api.php",
					}).get({
						action: "query",
						format: "json",
						list: "search",
						srsearch: gameName,
						srlimit: 1,
						srinfo: "",
						srprop: "",
						srinterwiki: 1,
					})
				).query.search[0].title;
			return enName;
		};
		root.querySelectorAll("template#Template:游戏分级 > parameter");
		for (const param of root.querySelectorAll(
			"template#Template:游戏分级 > parameter"
		)) {
			switch (
				`${param.name}-${param
					.querySelector("parameter-value")
					.toHtml()
					.trim()
					.toLowerCase()}`
			) {
				case "cero-ex":
					console.log("获取 CERO 分级");
					const ceroRank = await fetch(
						`https://www.cero.biz/search/search.cgi?name=${escape(
							encodingJapanese.convert(
								encodingJapanese.stringToCode(
									(
										await new mw.Api({
											url: "https://ja.wikipedia.org/w/api.php",
										}).get({
											action: "query",
											format: "json",
											list: "search",
											srsearch: gameName,
											srlimit: 1,
											srinfo: "",
											srprop: "",
											srinterwiki: 1,
										})
									).query.search[0].title
								),
								{
									from: "UNICODE",
									to: "EUC-JP",
									type: "string",
								}
							)
						)}`
					)
						.then(res => res.arrayBuffer())
						.then(buf => new TextDecoder("EUC-JP").decode(buf))
						.then(html =>
							new JSDOM(html).window.document
								.querySelector(
									"body > table > tbody > tr:last-of-type > td:last-of-type > table > tbody > tr:nth-of-type(2) > td:nth-of-type(4) > img"
								)
								?.alt?.trim()
								.toUpperCase()
						);
					console.log(`CERO-${ceroRank ?? "EX"}`);
					if (!ceroRank) break;
					param
						.querySelector("parameter-value")
						.replaceChildren(root.createTextNode(ceroRank));
					break;
				case "esrb-rp":
					console.log("获取 ESRB 分级");
					const { found, games } = await fetch(
						"https://www.esrb.org/wp-admin/admin-ajax.php",
						{
							method: "POST",
							headers: {
								"Content-Type":
									"application/x-www-form-urlencoded",
							},
							body: `action=search_rating&args%5BsearchKeyword%5D=${await getEnName()}&args%5BsearchType%5D=All&args%5Bpg%5D=1&args%5Bplatform%5D%5B%5D=All+Platforms&args%5Brating%5D%5B%5D=E&args%5Brating%5D%5B%5D=E10%2B&args%5Brating%5D%5B%5D=T&args%5Brating%5D%5B%5D=M&args%5Brating%5D%5B%5D=AO&args%5Bdescriptor%5D%5B%5D=All+Content&args%5Bielement%5D%5B%5D=all`,
						}
					).then(res => res.json());
					if (
						!found ||
						(games[0].title.toLowerCase() !==
							gameName.toLowerCase() &&
							games[0].submissionTitle.toLowerCase() !==
								gameName.toLowerCase())
					) {
						console.log("ESRB-RP");
						break;
					}
					const esrbRank = games[0]?.rating;
					console.log(`ESRB-${esrbRank}`);
					param
						.querySelector("parameter-value")
						.replaceChildren(root.createTextNode(esrbRank));
					break;
				case "usk-rp":
					console.log("获取 USK 分级");
					const uskRank = await fetch(
						`https://usk.de/en/?${new URLSearchParams({
							s: await getEnName(),
						})}`
					)
						.then(res => res.text())
						.then(html => {
							return [0, 6, 12, 16, 18][
								+[
									...[
										...[
											...new JSDOM(
												html
											).window.document.body.getElementsByClassName(
												"usktitle-card-game-list-title"
											),
										].filter(
											node =>
												node.getElementsByClassName(
													"usktitle-card-game-list-platform"
												)[0].textContent !== "(Trailer)"
										)[0].childNodes,
									]
										.filter(
											node =>
												node.nodeType === 3 &&
												node.data
													.trim()
													.includes(gameName)
										)[0]
										.parentNode.parentNode.parentNode.getElementsByClassName(
											"usktitle-card-game-list-icon"
										)[0].classList,
								]
									.filter(cls =>
										cls.startsWith(
											"usktitle-card-game-list-icon-"
										)
									)[0]
									.slice(29) - 1
							];
						})
						.catch(e => {
							if (e instanceof TypeError) return "RP";
							throw e;
						});
					console.log(`USK-${uskRank}`);
					if (uskRank === "RP") break;
					param
						.querySelector("parameter-value")
						.replaceChildren(root.createTextNode(uskRank));
					break;
			}
		}
		const edit = async () => {
			let result;
			try {
				result = await api.post({
					action: "edit",
					title,
					section: 0,
					text: root.toString(),
					summary:
						"自动更新[[Category:需要更新分级信息的游戏条目]]中的页面",
					tags: "Bot",
					bot: true,
					basetimestamp: timestamp,
					starttimestamp: curtimestamp,
					token: await api.getToken("csrf"),
				});
				if (result?.error?.code === "badtoken") {
					console.warn("badtoken");
					await api.getToken("csrf", true);
					return await edit();
				}
			} catch (e) {
				console.error(e);
				return;
			}
			console.table(result.edit);
			if (result.edit.nochange !== true) {
				console.info(
					`https://zh.moegirl.org.cn/Special:Diff/${result.edit.oldrevid}/${result.edit.newrevid}`
				);
			}
		};
		await edit();
	}
})();
