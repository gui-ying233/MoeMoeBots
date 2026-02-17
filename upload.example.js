"use strict";
const { mw, tracer, SpanStatusCode } = require("./mediaWiki");
const { createReadStream, statSync } = require("fs");

(async () => {
	await tracer.startActiveSpan(
		__filename.slice(__dirname.length + 1),
		async span => {
			try {
				const api = new mw.Api(require("./config").cm);
				const filepath = "example.jpg";
				await api.login();
				const r = await api.post({
					action: "upload",
					filename: "example",
					file: createReadStream(filepath, {
						highWaterMark: 1000000,
					}),
					filesize: statSync(filepath).size,
					token: await api.getToken("csrf"),
					comment: "upload TEST",
					text: "TEST",
					ignorewarnings: true,
				});
				console.log(r);
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
