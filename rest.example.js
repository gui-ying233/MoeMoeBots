"use strict";

const { mw } = require("./mediaWiki");
const rest = new mw.Rest(require("./config").mobile);

(async () => {
	console.log(
		await rest.get(
			"search/page",
			new URLSearchParams({
				q: "明日方舟",
			})
		)
	);
})();
