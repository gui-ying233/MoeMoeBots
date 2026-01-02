"use strict";

const { mw } = require("./mediaWiki");
const rest = new mw.Rest(require("./config").mzh);

(async () => {
	console.log(await rest.get("page/H:沙盒/bare"));
})();
