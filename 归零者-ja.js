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
				const api = new mw.Api(require("./config").ja);
				await api.login();
				const edit = async (retry = 0) => {
					if (retry >= 3) return;
					return await tracer.startActiveSpan("edit", async span => {
						try {
							if (retry)
								span.setAttribute(
									ATTR_HTTP_REQUEST_RESEND_COUNT,
									retry,
								);
							let r;
							try {
								r = setSpanAttributes(
									span,
									await api.post({
										action: "edit",
										text: "<noinclude>{{サンドボックス冒頭}}</noinclude>\n== ここから下に書き込んでください ==",
										summary: "砂場ならし",
										nocreate: true,
										tags: "Bot",
										bot: true,
										token: await api.getToken(
											"csrf",
											retry,
										),
										title: "ヘルプ:サンドボックス",
									}),
								);
								if (!r) throw new Error(r);
								if (r?.error) {
									span.setStatus({
										code: SpanStatusCode.ERROR,
										message: JSON.stringify(r.error),
									});
									console.error(r.error);
									span.end();
									return await edit(++retry);
								}
							} catch (e) {
								span.recordException(e);
								span.setStatus({
									code: SpanStatusCode.ERROR,
									message: e.message,
								});
								return console.error(e);
							}
							console.table(r.edit);
							if (r.edit.nochange !== true)
								console.info(
									`https://ja.moegirl.org.cn/Special:Diff/${r.edit.oldrevid}/${r.edit.newrevid}`,
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
					});
				};
				edit();
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
