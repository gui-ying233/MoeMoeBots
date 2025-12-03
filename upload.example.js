"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").cm);
const { createReadStream, statSync } = require("fs");

(async () => {
	const filepath = "example.jpg";
	await api.login();
	const r = await api.post({
		action: "upload",
		filename: "example",
		file: createReadStream(filepath, { highWaterMark: 1000000 }),
		filesize: statSync(filepath).size,
		token: await api.getToken("csrf"),
		comment: "upload TEST",
		text: "TEST",
		ignorewarnings: true,
	});
	console.log(r);
})();
