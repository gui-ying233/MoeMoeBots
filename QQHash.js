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
	if (!isMainThread) {
		const { h, u, s, e } = workerData,
			th = Buffer.from(h, "hex"),
			fs = createHash("sha3-512").update("MoegirlPediaUserQQHash-");
		for (let n = s; n <= e; n++) {
			if (!fs.copy().update(`${u}-${n}`).digest().equals(th)) continue;
			parentPort.postMessage({ t: "f", n });
			break;
		}
		process.exit(0);
	}
	execAsync(
		`powershell -Command "(Get-Process -Id ${process.pid}).PriorityClass = 'High'"`
	).catch(() => {});
	const fp = path.join("..", "QQHash", "QQHash.json");
	const QQHash = require(fp);
	await api.login();
	let ticontinue = "0";
	const pages = {};
	do {
		const r = await api.post({
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
	const pageEntries = Object.entries(pages);
	const fetchUserHash = async pageids => {
		return WikiParser.parse(
			(
				await api.post({
					action: "query",
					prop: "revisions",
					pageids,
					rvprop: "content",
					rvslots: "*",
				})
			).query.pages[0].revisions[0]?.slots.main.content
		)
			.querySelector("template#Template:QQHash > parameter#1")
			.getValue()
			.trim();
	};
	let nextFetch = null;
	for (let i = 0; i < pageEntries.length; i++) {
		const [u, pageids] = pageEntries[i];
		if (QQHash[u]) {
			nextFetch = null;
			continue;
		}
		console.log(`${Object.keys(QQHash).length}/${pageEntries.length}`);
		let h;
		if (nextFetch) {
			h = await nextFetch;
			nextFetch = null;
		} else h = await fetchUserHash(pageids);
		for (let j = i + 1; j < pageEntries.length; j++) {
			const [nextU, nextPageids] = pageEntries[j];
			if (QQHash[nextU]) continue;
			nextFetch = fetchUserHash(nextPageids);
			break;
		}
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
		];
		const runRangeHashcat = async () => {
			const userPrefix = Buffer.from(
				`MoegirlPediaUserQQHash-${u}-`
			).length;
			const formats = userPrefix <= 45 ? [1, 0] : [1];
			if (formats.length === 1)
				console.log(`用户名过长 (${userPrefix} bytes)，跳过 format 0`);
			for (const format of formats) {
				await execAsync(
					'powershell -Command "Get-Process hashcat -ErrorAction SilentlyContinue | Stop-Process -Force"'
				).catch(() => {});
				const prefix = `MoegirlPediaUserQQHash-${
					format ? `${u}-` : ""
				}`;
				const preBytes = Buffer.from(prefix).length + 5;
				console.log(`Hashcat: format ${format}`);
				const hashcatProcess = exec(
					`hashcat --backend-ignore-opencl -m 17600 -a 3 -w 3 --increment --increment-min ${preBytes} --increment-max ${
						preBytes + 5
					} hashcat.hex "${prefix + "?d".repeat(10)}"`,
					{ maxBuffer: 50 * 1024 * 1024 }
				);
				execAsync(
					`powershell -Command "Start-Sleep -Milliseconds 50; Get-Process hashcat -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`
				).catch(() => {});
				const result = await new Promise(resolve => {
					let stdout = "",
						stderr = "";
					hashcatProcess.stdout.on("data", d => (stdout += d));
					hashcatProcess.stderr.on("data", d => (stderr += d));
					hashcatProcess.on("close", code =>
						resolve({ stdout, stderr, code })
					);
					hashcatProcess.on("error", e => resolve(e));
				});
				if (result.stdout && result.stdout.includes("Skipping mask")) {
					continue;
				}
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
				const prefixes = [
					`MoegirlPediaUserQQHash-${u}-`,
					"MoegirlPediaUserQQHash-",
				];
				for (const line of lines) {
					if (line.startsWith(h + ":")) {
						const password = line.slice(129).trim();
						if (!password) continue;
						for (const p of prefixes) {
							if (!password.startsWith(p)) continue;
							const n_str = password.slice(p.length);
							const n = parseInt(n_str);
							if (isNaN(n)) continue;
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
			console.log("Starting Hashcat...");
			await runRangeHashcat();
			console.log("Hashcat completed");
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
