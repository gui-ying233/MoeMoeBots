"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").mzh);
const WikiParser = require("wikiparser-node");
WikiParser.config = "moegirl";
WikiParser.i18n = "zh-hans";
const path = require("path");
WikiParser.templateDir = path.join(__dirname, "template", "zh");
const { writeFile } = require("fs/promises");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const {
	Worker,
	isMainThread,
	parentPort,
	workerData,
} = require("worker_threads");
const { createHash } = require("crypto");

(async () => {
	execAsync(
		`powershell -Command "(Get-Process -Id ${process.pid}).PriorityClass = 'High'"`
	).catch(() => {});
	const fp = path.join("..", "QQHash", "QQHash.json");
	const QQHash = require(fp);
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
				(pages[WikiParser.normalizeTitle(p.title).toRootPage().main] =
					p.pageid)
		);
		ticontinue = r?.continue?.ticontinue;
	} while (ticontinue);
	for (const [u, pageids] of Object.entries(pages)) {
		if (QQHash[u]) continue;
		console.log(
			`${Object.keys(QQHash).length}/${Object.keys(pages).length}`
		);
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
			await writeFile(fp, JSON.stringify(QQHash, null, "\t"));
			continue;
		}
		const cpuRanges = [
				[10001, 1000000000],
				[1000000001, 2000000000],
				[2000000001, 3000000000],
				[3000000001, 4000000000],
				[4000000001, 5000000000],
				[5000000001, 6000000000],
			],
			hashcatRanges = [
				[10001, 999999999],
				[1000000000, 3000000000],
				[3000000001, 4000000000],
				[4000000001, 6000000000],
				[6000000001, 9999999999],
			],
			chunkSize = 5000000000;
		const runRangeHashcat = async (st, ed) => {
			for (let start = st; start <= ed; start += chunkSize) {
				const end = Math.min(start + chunkSize - 1, ed);
				const min_len = start.toString().length;
				const max_len = end.toString().length;
				for (let len = min_len; len <= max_len; len++) {
					const start_num = Math.max(start, 10 ** (len - 1));
					const end_num = Math.min(end, 10 ** len - 1);
					if (start_num > end_num) continue;
					const skip = start_num;
					const limit = end_num - start_num + 1;
					for (const format of [0, 1]) {
						await execAsync(
							'powershell -Command "Get-Process hashcat -ErrorAction SilentlyContinue | Stop-Process -Force"'
						).catch(() => {});
						const prefix =
							format === 0
								? `MoegirlPediaUserQQHash-${u}-`
								: "MoegirlPediaUserQQHash-";
						const hashcatProcess = exec(
							`hashcat --backend-ignore-opencl -m 17600 -a 3 -w 3 --skip ${skip} --limit ${limit} hashcat.hex "${
								prefix + "?d".repeat(len)
							}"`,
							{ maxBuffer: 50 * 1024 * 1024 }
						);
						execAsync(
							`powershell -Command "Start-Sleep -Milliseconds 50; Get-Process hashcat -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`
						).catch(() => {});
						const result = await new Promise(resolve => {
							let stdout = "",
								stderr = "";
							hashcatProcess.stdout.on(
								"data",
								d => (stdout += d)
							);
							hashcatProcess.stderr.on(
								"data",
								d => (stderr += d)
							);
							hashcatProcess.on("close", code =>
								resolve({ stdout, stderr, code })
							);
							hashcatProcess.on("error", e => resolve(e));
						});
						if (
							result.code != null &&
							result.code !== 0 &&
							result.code !== 1
						) {
							throw result;
						}
						const { stdout } = await execAsync(
							`hashcat --show -m 17600 hashcat.hex`,
							{ maxBuffer: 50 * 1024 * 1024 }
						);
						const lines = stdout.split("\n");
						for (const line of lines) {
							if (line.startsWith(h + ":")) {
								const password = line.split(":")[1];
								const n_str = password.slice(prefix.length);
								const n = parseInt(n_str);
								console.log(`QQ：${n}`);
								QQHash[u].QQ = n;
								await writeFile(
									fp,
									JSON.stringify(QQHash, null, "\t")
								);
								found = true;
								return;
							}
						}
					}
				}
			}
		};
		const runRangeCPU = async (st, ed) => {
			return new Promise(res => {
				const nw = require("os").cpus().length,
					cs = Math.ceil((ed - st + 1) / nw),
					ws = [];
				let completed = 0;
				const checkComplete = () => {
					completed++;
					if (completed === ws.length) res();
				};
				for (let i = 0; i < nw; i++) {
					const s = st + i * cs,
						e = Math.min(st + (i + 1) * cs - 1, ed),
						w = new Worker(__filename, {
							workerData: { h, u, s, e },
						});
					ws.push(w);
					w.on("message", async m => {
						if (m.t !== "f") return;
						ws.forEach(w => w.terminate());
						const QQ = m.n ?? null;
						console.log(`QQ：${QQ}`);
						QQHash[u].QQ = QQ;
						await writeFile(fp, JSON.stringify(QQHash, null, "\t"));
						found = true;
						res();
					});
					w.on("error", e => console.error(e));
					w.on("exit", c => {
						if (c !== 0 && !found)
							console.error(`Worker stopped with exit code ${c}`);
						checkComplete();
					});
				}
			});
		};
		console.log(u, h);
		await writeFile("hashcat.hex", h);
		let found = false;
		try {
			for (const [st, ed] of hashcatRanges) {
				console.log(`Starting: ${st}~${ed}`);
				await runRangeHashcat(st, ed);
				if (found) break;
				console.log(`Completed: ${st}~${ed}`);
			}
		} catch (e) {
			console.error("Hashcat failed, fallback to Crypto:", e);
		}
		if (!found) {
			console.log("Hashcat not found, fallback to Crypto");
			for (const [st, ed] of cpuRanges) {
				console.log(`Starting: ${st}~${ed}`);
				await runRangeCPU(st, ed);
				if (found) break;
				console.log(`Completed: ${st}~${ed}`);
			}
		}
		await writeFile(fp, JSON.stringify(QQHash, null, "\t"));
	}
})();

if (!isMainThread) {
	const { h, u, s, e } = workerData,
		th = Buffer.from(h, "hex"),
		fs = createHash("sha3-512").update("MoegirlPediaUserQQHash-");
	for (let n = s; n <= e; n++) {
		if (
			!fs.copy().update(`${u}-${n}`).digest().equals(th) &&
			!fs.copy().update(`${n}`).digest().equals(th)
		)
			continue;
		parentPort.postMessage({ t: "f", n });
		break;
	}
	process.exit(0);
}
