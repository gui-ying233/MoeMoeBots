"use strict";
const {
	mw,
	tracer,
	SpanStatusCode,
	setSpanAttributes,
} = require("./mediaWiki");

(async () => {
	await tracer.startActiveSpan(
		__filename.slice(__dirname.length + 1),
		async span => {
			const api = new mw.Api(require("./config").mzh);
			await api.login();
			const rest = new mw.Rest(
				Object.assign(require("./config").mzh, {
					cookie: api.cookie,
				}),
			);
			try {
				console.log(
					setSpanAttributes(
						span,
						await rest.get(
							"search/page",
							new URLSearchParams({
								q: "明日方舟",
							}),
						),
					),
				);
				span.setStatus({ code: SpanStatusCode.OK });
			} catch (e) {
				span.recordException(e);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: e.message,
				});
				throw e;
			} finally {
				span.end();
				await global.sdk?.shutdown();
			}
		},
	);
})();
