"use strict";
const {
	mw,
	tracer,
	SpanStatusCode,
	setSpanAttributes,
} = require("./mediaWiki");
const {
	ATTR_HTTP_REQUEST_RESEND_COUNT,
} = require("@opentelemetry/semantic-conventions");

(async () => {
	await tracer.startActiveSpan(
		__filename.slice(__dirname.length + 1),
		async span => {
			try {
				const api = new mw.Api(require("./config").mzh);
				async function cleaner(
					gcmtitle,
					regex,
					replace = "",
					skipTitle = /^$/,
				) {
					await tracer.startActiveSpan("cleaner", async span => {
						try {
							setSpanAttributes(
								span,
								{
									gcmtitle,
									regex,
									replace,
									skipTitle: skipTitle.toString(),
								},
								["params"],
							);
							let result1;
							try {
								result1 = setSpanAttributes(
									span,
									await api.get({
										action: "query",
										curtimestamp: 1,
										prop: "revisions",
										rvprop: "content|timestamp",
										generator: "categorymembers",
										gcmnamespace:
											"0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829",
										gcmlimit: "max",
										gcmtitle,
									}),
								);
								if (!result1) throw new Error(result1);
							} catch (e) {
								span.recordException(e);
								span.setStatus({
									code: SpanStatusCode.ERROR,
									message: e.message,
								});
								return console.error(e);
							}
							if (result1.query === undefined)
								return (
									span.setStatus({
										code: SpanStatusCode.OK,
									}) && console.log("无页面")
								);
							console.log(
								`${gcmtitle}中共${result1.query.pages.length}个页面。`,
							);
							for (
								let i = 0;
								i < result1.query.pages.length;
								i++
							) {
								console.log(
									`第${i + 1}个页面：${result1.query.pages[i].title}`,
								);
								if (
									new RegExp(
										/^(?:Template:Sandbox|Template:沙盒|模块:Sandbox)\//,
									).test(result1.query.pages[i].title) ||
									new RegExp(skipTitle).test(
										result1.query.pages[i].title,
									)
								) {
									console.log("跳过页面");
								} else if (
									result1.query.pages[
										i
									].revisions[0].content.match(
										/{{\s*:?\s*(?:Template\s*:|[模样樣]板\s*:|T\s*:)?\s*(?:施工中|[编編][辑輯]中|inuse).*?}}/gi,
									) !== null
								) {
									console.log("施工中");
								} else {
									let replaceText = "";
									if (
										typeof regex === "object" &&
										regex.toString().split("")[1] === "{"
									) {
										if (
											result1.query.pages[
												i
											].revisions[0].content.search(
												regex,
											) === -1
										) {
											console.warn("未找到匹配");
											continue;
										}
										let symbolCounter = 0;
										const obj = result1.query.pages[
											i
										].revisions[0].content
											.slice(
												result1.query.pages[
													i
												].revisions[0].content.search(
													regex,
												),
											)
											.split("");
										for (let j = 0; j < obj.length; j++) {
											const word = obj[j];
											replaceText += word;
											switch (word) {
												case "{":
													symbolCounter--;
													break;
												case "}":
													symbolCounter++;
													break;
											}
											if (
												!symbolCounter &&
												obj[j + 1] === "\n"
											) {
												replaceText += "\n";
												break;
											} else if (!symbolCounter) break;
										}
									} else replaceText = regex;
									const edit = async (retry = 0) => {
										if (retry >= 3) return;
										return await tracer.startActiveSpan(
											"cleaner.edit",
											async span => {
												try {
													if (retry)
														span.setAttribute(
															ATTR_HTTP_REQUEST_RESEND_COUNT,
															retry,
														);
													let result2;
													try {
														result2 =
															setSpanAttributes(
																span,
																await api.post({
																	action: "edit",
																	title: result1
																		.query
																		.pages[
																		i
																	].title,
																	text: result1.query.pages[
																		i
																	].revisions[0].content.replace(
																		replaceText,
																		replace,
																	),
																	summary: `自动修复[[${gcmtitle}]]中的页面`,
																	tags: "Bot",
																	bot: true,
																	basetimestamp:
																		result1
																			.query
																			.pages[
																			i
																		]
																			.revisions[0]
																			.timestamp,
																	starttimestamp:
																		result1.curtimestamp,
																	token: await api.getToken(
																		"csrf",
																		retry,
																	),
																}),
															);
														if (result2?.error) {
															span.setStatus({
																code: SpanStatusCode.ERROR,
																message:
																	JSON.stringify(
																		result2.error,
																	),
															});
															console.error(
																result2.error,
															);
															span.end();
															return await edit(
																++retry,
															);
														}
													} catch (e) {
														span.recordException(e);
														span.setStatus({
															code: SpanStatusCode.ERROR,
															message: e.message,
														});
														return console.error(e);
													}
													console.table(result2.edit);
													if (
														result2.edit
															.nochange !== true
													) {
														console.info(
															`https://zh.moegirl.org.cn/Special:Diff/${result2.edit.oldrevid}/${result2.edit.newrevid}`,
														);
													}
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
									return await edit();
								}
							}
							span.setStatus({ code: SpanStatusCode.OK });
							span.end();
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
					});
				}

				await api.login();
				await cleaner(
					"CAT:需要更换为标题格式化的页面",
					/{{\s*:?\s*(?:Template\s*:|[模样樣]板\s*:|T\s*:)?\s*(?:[标標][题題]替[换換]|替[换換][标標][题題]).*}}\n?/gis,
					"{{标题格式化}}",
				);
				await cleaner(
					"CAT:需要更换为小写标题的页面",
					/{{\s*:?\s*(?:Template\s*:|[模样樣]板\s*:|T\s*:)?\s*(?:[标標][题題]替[换換]|替[换換][标標][题題]).*}}\n?/gis,
					"{{小写标题}}",
				);
				await cleaner(
					"CAT:不必要使用override参数的音乐条目",
					/\|override=1\n?/g,
				);
				await cleaner(
					"CAT:错误使用标题替换模板的页面",
					/{{\s*:?\s*(?:Template\s*:|[模样樣]板\s*:|T\s*:)?\s*(?:[标標][题題]替[换換]|替[换換][标標][题題]).*}}\n?/gis,
					"",
					/^Category:需要更换为(?:标题格式化|小写标题)的页面$/,
				);
				await cleaner(
					"CAT:错误使用NoSubpage的页面",
					/{{\s*:?\s*(?:Template\s*:|[模样樣]板\s*:|T\s*:)?\s*NoSubpage.*}}\n?/gis,
				);
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
