"use strict";
const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").mzh);
const WikiParser = require("wikiparser-node");
WikiParser.config = "moegirl";
WikiParser.i18n = "zh-hans";
const path = require("path");
WikiParser.templateDir = path.join(__dirname, "template", "zh");
const { readFile, writeFile } = require("fs/promises");
const {
	Worker,
	isMainThread,
	parentPort,
	workerData,
} = require("worker_threads");
const { createHash } = require("crypto");

(async () => {
	const fp = path.join("..", "QQHash", "QQHash.json");
	console.log(fp);
	if (isMainThread) {
		const QQHash = JSON.parse(await readFile(fp, { encoding: "utf-8" }));
		await api.login();
		let ticontinue = "0";
		const pages = {};
		do {
			const r = await api.get({
				action: "query",
				prop: "transcludedin",
				titles: "Template:QQHash",
				tiprop: "pageid|title",
				tinamespace: "2",
				tilimit: "max",
				ticontinue,
			});
			r.query.pages[0].transcludedin.forEach(
				p =>
					(pages[
						WikiParser.normalizeTitle(p.title).toRootPage().main
					] = p.pageid)
			);
			ticontinue = r?.continue?.ticontinue;
		} while (ticontinue);
		for (const [u, pageids] of Object.entries(pages)) {
			if (QQHash[u]) continue;
			const r = await api.post({
					action: "query",
					prop: "revisions",
					pageids,
					rvprop: "content",
					rvslots: "*",
				}),
				h = WikiParser.parse(
					r.query.pages[0].revisions[0]?.slots.main.content
				)
					.querySelector("template#Template:QQHash > parameter#1")
					.getValue()
					.trim();
			QQHash[u] = {
				Hash: h,
				QQ: null,
			};
			if (!/^[a-z0-9]{128}$/.test(h)) {
				writeFile(fp, JSON.stringify(QQHash, null, "\t"));
				continue;
			}
			const nw = require("os").cpus().length,
				ranges = [
					[10001, 1000000000],
					[1000000001, 2000000000],
					[2000000001, 3000000000],
					[4000000001, 5000000000],
					[5000000001, 6000000000],
					// [6000000001, 7000000000],
					// [7000000001, 8000000000],
				],
				runRange = async (st, ed) => {
					const cs = Math.ceil((ed - st + 1) / nw),
						ws = [];
					for (let i = 0; i < nw; i++) {
						const s = st + i * cs,
							e = Math.min(st + (i + 1) * cs - 1, ed),
							w = new Worker(__filename, {
								workerData: { h, u, s, e },
							});
						ws.push(w);
						w.on("message", m => {
							if (m.t !== "f") return;
							ws.forEach(w => w.terminate());
							QQHash[u].QQ = m.n;
							writeFile(fp, JSON.stringify(QQHash, null, "\t"));
							process.exit(0);
						});
						w.on("error", e => console.error(e));
						w.on(
							"exit",
							c =>
								c !== 0 &&
								console.error(
									`Worker stopped with exit code ${c}`
								)
						);
					}
					return new Promise(res => {
						let completed = 0;
						ws.forEach(w => {
							w.on("exit", () => {
								completed++;
								if (completed === ws.length) res();
							});
						});
					});
				};
			console.log(u, h);
			for (const [st, ed] of ranges) {
				console.log(`Starting search: ${st}~${ed}`);
				await runRange(st, ed);
				console.log(`Completed: ${st}~${ed}`);
			}
			writeFile(fp, JSON.stringify(QQHash, null, "\t"));
			break;
		}
	} else {
		const { h, u, s, e } = workerData,
			th = Buffer.from(h, "hex"),
			fs = `MoegirlPediaUserQQHash-${u}-`;
		for (let n = s; n <= e; n++) {
			if (
				!createHash("sha3-512")
					.update(fs + n)
					.digest()
					.equals(th)
			)
				continue;
			parentPort.postMessage({ t: "f", n });
			break;
		}
	}
})();
