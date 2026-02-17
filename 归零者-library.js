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
				const api = new mw.Api(require("./config").library);
				await api.login();
				const edit = async (page, retry = 0) => {
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
										text: "",
										nocreate: true,
										tags: "Bot",
										bot: true,
										token: await api.getToken(
											"csrf",
											retry,
										),
										...page,
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
									return await edit(page, ++retry);
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
									`https://library.moegirl.org.cn/Special:Diff/${r.edit.oldrevid}/${r.edit.newrevid}`,
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
				[
					{
						title: "模板:沙盒",
						summary:
							"沙盒清理作业，若想保留较长时间，可以在[[特殊:我的用户页/Sandbox|个人测试区]]作测试，或者翻阅历史记录。",
					},
					{
						title: "帮助:沙盒",
						summary:
							"沙盒清理作业，若想保留较长时间，可以在[[特殊:我的用户页/Sandbox|个人测试区]]作测试，或者翻阅历史记录。",
					},
					{
						title: "模块:沙盒",
						summary:
							"沙盒清理作业，若想保留较长时间，可以在个人测试区作测试，或者翻阅历史记录。",
					},
				].forEach(edit);
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
