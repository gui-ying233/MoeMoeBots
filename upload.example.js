const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").uk);
const { createReadStream, statSync } = require("fs");
(async () => {
	const filepath = "example.jpg";
	const filesize = statSync(filepath).size;
	const file = createReadStream(filepath, { highWaterMark: 1000000 });
	await api.login();
	const r = await api.post({
		action: "upload",
		filename: "example",
		file,
		filesize,
		token: await api.getToken("csrf"),
		comment: "upload TEST",
		text: "TEST",
		ignorewarnings: true,
	});
	console.log(r);
})();
