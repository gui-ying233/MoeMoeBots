"use strict";

/**
 * @import { ReadStream } from "fs"
 * @import { ApiResponse } "types-mediawiki/mw/Api"
 * @import { ApiLoginParams, ApiTokenType, ApiParams, ApiFormatJsonParams } "types-mediawiki-api"
 * @class Api
 */
class Api {
	/** @type { URL["href"] } */
	#api;
	/** @type { string } */
	#botUsername;
	/** @type { string } */
	#botPassword;
	/** @type { { string: string } } */
	#cookie;
	/** @type { { get: RequestInit; post: RequestInit } } */
	#init;
	/** @type { { format: ApiParams["format"] ; utf8: ApiFormatJsonParams["utf8"]; formatversion: ApiFormatJsonParams["formatversion"] } } */
	#parameters = { format: "json", utf8: true, formatversion: 2 };
	/** @type { Record<`${ApiTokenType}token`, string> } */
	#tokens = {};
	/** @type { { string: string } } */
	#defaultCookie = {};
	/**
	 * @param { { url: URL["href"]; botUsername: string; botPassword: string; cookie:{ string: string } } } config
	 */
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
	/**
	 * @private
	 */
	#updateInit() {
		Object.entries(this.#init).forEach(([m]) => {
			this.#init[m].headers.cookie = Object.entries(this.#cookie)
				.map(([k, v]) => `${k}=${v}`)
				.join("; ");
		});
	}
	/**
	 * @private
	 * @param { Response<ApiResponse> } res
	 * @returns { any }
	 */
	#parseRes(res) {
		res.headers
			.getSetCookie()
			.forEach(c => (this.#cookie[c.split("=")[0]] = c.split("=")[1]));
		this.#updateInit();
		return res.json();
	}
	/**
	 * @private
	 * @param { ApiParams } parameters
	 * @returns { ApiParams }
	 */
	#listToPipe(parameters) {
		return Object.fromEntries(
			Object.entries(parameters).map(([k, v]) =>
				Array.isArray(v) ? [k, v.join("|")] : [k, v]
			)
		);
	}
	/**
	 * @async
	 * @param { ApiParams } parameters
	 * @returns { Promise<ApiResponse> }
	 */
	async get(parameters) {
		return await fetch(
			`${this.#api}?${new URLSearchParams({
				...this.#parameters,
				...this.#listToPipe(parameters),
			})}`,
			this.#init.get
		).then(this.#parseRes.bind(this));
	}
	/**
	 * @async
	 * @param { ApiTokenType } type
	 * @param { boolean } newToken
	 * @returns { string | Promise<string> }
	 * @throws { TypeError }
	 */
	async getToken(type, newToken = false) {
		if (type === undefined) type = "csrf";
		else if (typeof type !== "string") throw new TypeError("types");
		if (
			newToken ||
			[undefined, "+\\"].includes(this.#tokens?.[`${type}token`])
		)
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
	/**
	 * @async
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @returns { Promise<ApiResponse> }
	 * @throws { TypeError }
	 */
	async post(parameters) {
		if (parameters.action === "upload" && parameters.file) {
			const { file, filesize } = parameters;
			if (file.constructor.name !== "ReadStream")
				throw new TypeError("file");
			const async = filesize > file.readableHighWaterMark;
			delete parameters.file;
			parameters.offset = 0;
			await new Promise((res, rej) => {
				file.on("data", async chunk => {
					file.pause();
					const body = new FormData();
					Object.entries({
						...this.#parameters,
						...this.#listToPipe(parameters),
						stash: async,
						async,
					}).forEach(([k, v]) => body.append(k, v));
					body.append("chunk", new Blob([chunk]));
					const r = await fetch(this.#api, {
						...this.#init.post,
						body,
					}).then(this.#parseRes.bind(this));
					parameters.filekey = r?.upload?.filekey;
					if (r?.upload?.result === "Success") {
						return res(delete parameters.offset);
					}
					if (r?.upload?.result !== "Continue")
						return rej(new Error(JSON.stringify(r)));
					parameters.offset = r.upload.offset;
					file.resume();
				});
				file.on("error", rej);
			}).finally(() => file.destroyed || file.destroy());
		}
		return await fetch(this.#api, {
			...this.#init.post,
			body: new URLSearchParams({
				...this.#parameters,
				...this.#listToPipe(parameters),
			}),
		}).then(this.#parseRes.bind(this));
	}
	/**
	 * @async
	 * @private
	 * @param { ApiLoginParams["lgname"] } lgname
	 * @param { ApiLoginParams["lgpassword"] } lgpassword
	 * @param { ApiLoginParams["lgtoken"] } [lgtoken]
	 * @returns { Promise<ApiResponse> }
	 * @throws { Error }
	 */
	async #login(lgname, lgpassword, lgtoken) {
		lgtoken = lgtoken ?? (await this.getToken("login"));
		const r = await this.post({
			action: "login",
			lgname,
			lgpassword,
			lgtoken,
		});
		if (r?.login?.result === "NeedToken")
			return await this.login(lgname, lgpassword, r?.login?.token);
		if (r?.login?.result === "Success") return r;
		if (r?.login?.result)
			throw new Error(
				r?.login?.reason ?? r?.login?.result ?? r?.login ?? r
			);
		throw new Error();
	}
	/**
	 * @async
	 * @param { ApiLoginParams["lgname"] } [lgname]
	 * @param { ApiLoginParams["lgpassword"] } [lgpassword]
	 * @returns { Promise<ApiResponse> }
	 * @throws { Error }
	 */
	async login(lgname = this.#botUsername, lgpassword = this.#botPassword) {
		return await this.#login(lgname, lgpassword);
	}
	/**
	 * @async
	 * @returns { Promise<ApiResponse> }
	 */
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

/** @type { { Api: typeof Api } } */
module.exports = { mediaWiki: { Api }, mw: { Api } };
