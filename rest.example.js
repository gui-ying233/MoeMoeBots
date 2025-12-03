"use strict";

const { mw } = require("./mediaWiki");
const api = new mw.Api(require("./config").mzh);
const rest = new mw.Rest(
	Object.assign(require("./config").mzh, {
		url: "https://mzh.moegirl.org.cn/rest.php/v1/",
	})
);
(async () => {
	console.log(await rest.get("page/H:沙盒/bare"));
})();
