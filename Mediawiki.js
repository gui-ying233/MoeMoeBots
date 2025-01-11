"use strict";

class Api {
	#api;
	#botUsername;
	#botPassword;
	#cookie;
	#init;
	#parameters = { format: "json", utf8: 1, formatversion: 2 };
	#tokens = {};
	#defaultCookie = {};
	constructor({ url, botUsername, botPassword, cookie = {} }) {
		url = new URL(url);
		url.hash = "";
		url.search = "";
		this.#api = url.href;
		this.#init = {
			get: { headers: { referer: url.href } },
			post: { headers: { referer: url.href }, method: "POST" },
		};
		this.#botUsername = botUsername;
		this.#botPassword = botPassword;
		this.#defaultCookie = cookie;
		this.#cookie = this.#defaultCookie;
		this.#updateInit();
	}
	#updateInit() {
		Object.entries(this.#init).forEach(([m]) => {
			this.#init[m].headers.cookie = Object.entries(this.#cookie)
				.map(([k, v]) => `${k}=${v}`)
				.join("; ");
		});
	}
	#parseRes(res) {
		res.headers
			.getSetCookie()
			.forEach(c => (this.#cookie[c.split("=")[0]] = c.split("=")[1]));
		this.#updateInit();
		return res.json();
	}
	#listToPipe(parameters) {
		return Object.fromEntries(
			Object.entries(parameters).map(([k, v]) =>
				Array.isArray(v) ? [k, v.join("|")] : [k, v]
			)
		);
	}
	async get(parameters) {
		return fetch(
			`${this.#api}?${new URLSearchParams({
				...this.#parameters,
				...this.#listToPipe(parameters),
			})}`,
			this.#init.get
		).then(this.#parseRes.bind(this));
	}
	async getToken(type, newToken = false) {
		if (type === undefined) type = "csrf";
		else if (typeof type !== "string") throw new TypeError("types");
		if (newToken || !this.#tokens[`${type}token`])
			this.#tokens = (
				await this.get({
					action: "query",
					meta: "tokens",
					type: [
						"createaccount",
						"csrf",
						"login",
						"patrol",
						"rollback",
						"userrights",
						"watch",
					],
				})
			).query.tokens;
		return this.#tokens[`${type}token`];
	}
	async post(parameters) {
		return fetch(this.#api, {
			...this.#init.post,
			body: new URLSearchParams({
				...this.#parameters,
				...this.#listToPipe(parameters),
			}),
		}).then(this.#parseRes.bind(this));
	}
	async #login(lgname, lgpassword, lgtoken) {
		lgtoken = lgtoken ?? (await this.getToken("login"));
		const r = await this.post({
			action: "login",
			lgname,
			lgpassword,
			lgtoken,
		});
		if (r?.login?.result === "NeedToken")
			return this.login(lgname, lgpassword, r?.login?.token);
		if (r?.login?.result === "Success") return r;
		if (r?.login?.result)
			throw new Error(r?.login?.result ?? r?.login ?? r);
		throw new Error();
	}
	async login(lgname = this.#botUsername, lgpassword = this.#botPassword) {
		return this.#login(lgname, lgpassword);
	}
	async logout() {
		const r = await this.post({
			action: "logout",
			token: await this.getToken("csrf", true),
		});
		this.#tokens = {};
		this.#cookie = this.#defaultCookie;
		this.#updateInit();
		return r;
	}
}
const mediaWiki = { Api };
const mw = mediaWiki;
module.exports = { mediaWiki, mw };
