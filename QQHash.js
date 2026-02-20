"use strict";
const {
	mw,
	tracer,
	SpanStatusCode,
	setSpanAttributes,
} = require("./mediaWiki");
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
const { error } = require("console");

(async () => {
	if (!isMainThread) {
		const { h, u, s, e } = workerData,
			th = Buffer.from(h, "hex"),
			prefix = u ? `${u}-` : "",
			fs = createHash("sha3-512").update(
				`MoegirlPediaUserQQHash-${prefix}`,
			);
		for (let n = s; n <= e; n++) {
			if (!fs.copy().update(String(n)).digest().equals(th)) continue;
			parentPort.postMessage({ t: "f", n });
			break;
		}
		process.exit(0);
	}
	await tracer.startActiveSpan(
		__filename.slice(__dirname.length + 1),
		async span => {
			try {
				const api = new mw.Api(require("./config").mzh);
				execAsync(
					`powershell -Command "(Get-Process -Id ${process.pid}).PriorityClass = 'High'"`,
				).catch(() => {});
				const fp = path.join("..", "QQHash", "QQHash.json");
				const QQHash = require(fp);
				await api.login().catch(() => {});
				let ticontinue = "0",
					hasHashcat = false;
				setSpanAttributes(
					span,
					await execAsync("hashcat --version")
						.then(d => {
							hasHashcat = true;
							console.log(`Hashcat: ${d.stdout.trim()}`);
							return { exists: true, std: JSON.stringify(d) };
						})
						.catch(e => {
							return { exists: false, std: JSON.stringify(e) };
						}),
					["hashcat"],
				);
				const pages = {};
				do {
					const r = setSpanAttributes(
						span,
						await api.get({
							action: "query",
							prop: "transcludedin",
							titles: "Template:QQHash",
							tiprop: "pageid|title",
							tinamespace: "2",
							tilimit: "max",
							ticontinue,
						}),
						["mw-response", "ticontinue#" + ticontinue],
					);
					r.query.pages[0].transcludedin.forEach(
						p =>
							(pages[
								WikiParser.normalizeTitle(
									p.title,
								).toRootPage().main
							] = p.pageid),
					);
					ticontinue = r?.continue?.ticontinue;
				} while (ticontinue);
				const pageEntries = Object.entries(pages);
				const fetchUserHash = async pageids => {
					return await tracer.startActiveSpan(
						"fetchUserHash",
						async span => {
							try {
								setSpanAttributes(span, { pageids }, [
									"params",
								]);
								return (
									span.setStatus({ code: SpanStatusCode.OK }),
									WikiParser.parse(
										setSpanAttributes(
											span,
											await api.get({
												action: "query",
												prop: "revisions",
												pageids,
												rvprop: "content",
												rvslots: "*",
											}),
										).query.pages[0].revisions[0]?.slots
											.main.content,
									)
										.querySelector(
											"template#Template:QQHash > parameter#1",
										)
										.getValue()
										.trim()
								);
							} catch (e) {
								span.recordException(e);
								span.setStatus({
									code: SpanStatusCode.ERROR,
									message: e.message,
								});
								console.error(e);
							} finally {
								span.end();
							}
						},
					);
				};
				let nextFetch = null;
				for (let i = 0; i < pageEntries.length; i++) {
					const [u, pageids] = pageEntries[i];
					if (QQHash[u]) {
						nextFetch = null;
						continue;
					}
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
						H: h,
						Q: null,
					};
					if (!/^[a-z0-9]{128}$/.test(h)) {
						await writeFile(fp, JSON.stringify(QQHash));
						continue;
					}
					const cryptoRanges = [
						[10001, 1000000000],
						[1000000001, 2000000000],
						[2000000001, 3000000000],
						[3000000001, 4000000000],
						[4000000001, 5000000000],
						[5000000001, 6000000000],
					];
					const runRangeHashcat = async u => {
						return await tracer.startActiveSpan(
							"runRangeHashcat",
							async span => {
								try {
									setSpanAttributes(span, { u }, ["params"]);
									const userPrefix = Buffer.from(
										`MoegirlPediaUserQQHash-${u}-`,
									).length;
									if (userPrefix > 45) {
										console.info(
											`用户名过长 (${userPrefix} bytes)，将回退到 Crypto`,
										);
										span.setStatus({
											code: SpanStatusCode.OK,
										});
										return false;
									}
									await execAsync(
										'powershell -Command "Get-Process hashcat -ErrorAction SilentlyContinue | Stop-Process -Force"',
									).catch(() => {});
									const prefix = `MoegirlPediaUserQQHash-${u}-`;
									const preBytes =
										Buffer.from(prefix).length + 5;
									const mask = prefix + "?d".repeat(10);
									await writeFile("hashcat.mask", mask);
									console.log("Hashcat: ");
									const hashcatProcess = exec(
										`hashcat --backend-ignore-opencl -m 17600 -a 3 -w 4 --increment --increment-min ${preBytes} --increment-max ${
											preBytes + 5
										} hashcat.hex hashcat.mask`,
										{ maxBuffer: 50 * 1024 * 1024 },
									);
									execAsync(
										`powershell -Command "Start-Sleep -Milliseconds 50; Get-Process hashcat -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`,
									).catch(() => {});
									const result = setSpanAttributes(
										span,
										await new Promise((res, rej) => {
											let stdout = "",
												stderr = "";
											hashcatProcess.stdout.on(
												"data",
												d => (stdout += d),
											);
											hashcatProcess.stderr.on(
												"data",
												d => (stderr += d),
											);
											hashcatProcess.on("close", code => {
												return (
													![null, 0, 1].includes(code)
														? rej
														: res
												)({
													stdout,
													stderr,
													code,
												});
											});
											hashcatProcess.on("error", error =>
												rej({
													stdout,
													stderr,
													error,
												}),
											);
										}),
										["result"],
									);
									if (
										result.stdout &&
										result.stdout.includes("Skipping mask")
									) {
										span.setStatus({
											code: SpanStatusCode.OK,
										});
										return;
									}
									const { stdout } = await execAsync(
										`hashcat --show -m 17600 hashcat.hex`,
										{ maxBuffer: 50 * 1024 * 1024 },
									);
									const lines = stdout.split("\n");
									const prefixes = [
										`MoegirlPediaUserQQHash-${u}-`,
										"MoegirlPediaUserQQHash-",
									];
									for (const line of lines) {
										if (line.startsWith(h + ":")) {
											const password = line
												.slice(129)
												.trim();
											if (!password) continue;
											for (const p of prefixes) {
												if (!password.startsWith(p))
													continue;
												const n_str = password.slice(
													p.length,
												);
												const n = parseInt(n_str);
												if (isNaN(n)) continue;
												console.log(`QQ：${n}`);
												QQHash[u].Q = n;
												await writeFile(
													fp,
													JSON.stringify(QQHash),
												);
												found = true;
												span.setStatus({
													code: SpanStatusCode.OK,
												});
												return;
											}
										}
									}
									span.setStatus({
										code: SpanStatusCode.OK,
									});
									return true;
								} catch (e) {
									span.recordException(e);
									span.setStatus({
										code: SpanStatusCode.ERROR,
										message: e.message,
									});
									console.error(e);
								} finally {
									span.end();
								}
							},
						);
					};
					const runRangeCrypto = async (u, st, ed) => {
						return await tracer.startActiveSpan(
							"runRangeCrypto",
							async span => {
								try {
									setSpanAttributes(span, { u }, ["params"]);
									return new Promise(res => {
										const nw = require("os").cpus().length,
											cs = Math.ceil((ed - st + 1) / nw),
											ws = [];
										let completed = 0,
											terminated = false,
											found_range = false;
										const checkComplete = () => {
											completed++;
											if (completed === ws.length)
												res(found_range);
										};
										for (let i = 0; i < nw; i++) {
											const s = st + i * cs,
												e = Math.min(
													st + (i + 1) * cs - 1,
													ed,
												),
												w = new Worker(__filename, {
													workerData: { h, u, s, e },
												});
											ws.push(w);
											w.on("message", async m => {
												if (m.t !== "f") return;
												terminated = true;
												ws.forEach(w => w.terminate());
												const QQ = m.n ?? null;
												console.log(`QQ：${QQ}`);
												QQHash[u].Q = QQ;
												await writeFile(
													fp,
													JSON.stringify(QQHash),
												);
												found_range = true;
												found = true;
												res(true);
											});
											w.on("error", e =>
												console.error(e),
											);
											w.on("exit", c => {
												if (c !== 0 && !terminated)
													console.error(
														`Worker stopped with exit code ${c}`,
													);
												checkComplete();
											});
										}
									})
										.then(r => {
											span.setStatus({
												code: SpanStatusCode.OK,
												r,
											});
											return r;
										})
										.catch(e => {
											span.recordException(e);
											span.setStatus({
												code: SpanStatusCode.ERROR,
												message: e.message,
											});
											console.error(e);
											throw e;
										})
										.finally(() => span.end());
								} catch (e) {
									span.recordException(e);
									span.setStatus({
										code: SpanStatusCode.ERROR,
										message: e.message,
									});
									console.error(e);
									span.end();
									throw e;
								}
							},
						);
					};
					console.log(u, h);
					await writeFile("hashcat.hex", h);
					let found = false,
						needCpuFallback = false;
					if (hasHashcat) {
						try {
							const result = await runRangeHashcat(u);
							if (!result) {
								needCpuFallback = true;
							}
						} catch (e) {
							console.error(
								"Hashcat failed, fallback to Crypto:",
								e,
							);
							needCpuFallback = true;
						}
					}
					if (!found && (needCpuFallback || !hasHashcat)) {
						console.log("Crypto: ");
						for (const [st, ed] of cryptoRanges) {
							console.log(`Starting: ${st}~${ed}`);
							const found_in_range = await runRangeCrypto(
								u,
								st,
								ed,
							);
							if (found_in_range) break;
							console.log(`Completed: ${st}~${ed}`);
						}
					}
					await writeFile(fp, JSON.stringify(QQHash));
				}
				span.setStatus({ code: SpanStatusCode.OK });
			} catch (e) {
				span.recordException(e);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: e.message,
				});
				console.error(e);
			} finally {
				span.end();
				await global.sdk?.shutdown();
			}
		},
	);
})();
