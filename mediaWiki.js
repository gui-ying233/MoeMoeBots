"use strict";
/**
 * @import { ReadStream } "fs"
 * @import { ApiResponse } "types-mediawiki/mw/Api"
 * @import { RestResponse } "types-mediawiki/mw/Rest"
 * @import { ApiLoginParams, ApiTokenType, ApiParams, ApiFormatJsonParams } "types-mediawiki-api"
 * @import "types-mediawiki/mw/Rest"
 */

/** @type {string: string} */
const cookies = {};

/** @type {string: any} */
const pack = require("./package.json");

/** @class Api */
class Api {
	/** @type { URL["href"] } */
	#api;
	/** @type { string } */
	#botUsername;
	/** @type { string } */
	#botPassword;
	/** @type { { get: RequestInit; post: RequestInit } } */
	#init;
	/** @type { { format: ApiParams["format"]; errorsuselocal: ApiParams["errorsuselocal"]; utf8: ApiFormatJsonParams["utf8"]; formatversion: ApiFormatJsonParams["formatversion"] } } */
	#parameters = {
		format: "json",
		errorsuselocal: true,
		utf8: true,
		formatversion: 2,
	};
	/** @type { Record<`${ApiTokenType}token`, string> | Promise<Record<`${ApiTokenType}token`, string>> | null } */
	#tokens = null;
	/** @type { { string: string } } */
	#defaultCookie = {};
	/**
	 * @param { { url: URL["href"]; botUsername: string; botPassword: string; cookie:{ string: string } } } config
	 */
	constructor({ api, botUsername, botPassword, cookie = {} }) {
		api = new URL(api);
		api.hash = "";
		api.search = "";
		this.#api = api.href;
		const headers = {
			referer: api.href,
			"user-agent": `${pack.name || ""}/${pack.version || ""} (+${
				pack.homepage || pack.repository?.url || pack?.bugs?.url || ""
			}; ${pack.bugs?.email || ""}) `,
			cookie: cookies,
		};
		this.#init = {
			get: { headers },
			post: { headers, method: "POST" },
		};
		this.#botUsername = botUsername;
		this.#botPassword = botPassword;
		this.#defaultCookie = cookie;
		Object.assign(cookies, this.#defaultCookie);
	}
	/**
	 * @private
	 * @param { Response<ApiResponse> } res
	 * @returns { any }
	 */
	#parseRes(res) {
		res.headers
			.getSetCookie()
			.forEach(c => (cookies[c.split("=")[0]] = c.split(/[=;]/)[1]));
		return res.json();
	}
	/**
	 * @private
	 * @param { RequestInit & { cookie: { string: string } } } init
	 * @returns { RequestInit }
	 */
	#cookies2string(init) {
		return Object.assign(Object.assign({}, init), {
			headers: Object.assign(Object.assign({}, init.headers), {
				cookie: Object.entries(init.headers.cookie)
					.map(([k, v]) => `${k}=${v}`)
					.join("; "),
			}),
		});
	}
	/**
	 * @private
	 * @param { ApiParams } parameters
	 * @returns { ApiParams }
	 */
	#listToPipe(parameters) {
		return Object.fromEntries(
			Object.entries(parameters)
				.filter(
					([k, v]) =>
						Object.keys(this.#parameters).includes(k) ||
						(v !== false && v !== null && v !== undefined)
				)
				.map(([k, v]) => (Array.isArray(v) ? [k, v.join("|")] : [k, v]))
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
			this.#cookies2string(this.#init.get)
		).then(this.#parseRes.bind(this));
	}
	/**
	 * @async
	 * @param { ApiTokenType } [type]
	 * @param { boolean } [newToken]
	 * @returns { string | Promise<string> }
	 * @throws { TypeError }
	 */
	async getToken(type = "csrf", newToken = false) {
		if (typeof type !== "string") throw new TypeError("types");
		if (this.#tokens instanceof Promise) this.#tokens = await this.#tokens;
		const key = `${type}token`;
		if (
			newToken ||
			!this.#tokens ||
			!this.#tokens[key] ||
			[undefined, "+\\"].includes(this.#tokens[key])
		) {
			this.#tokens = this.get({
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
			}).then(res => res.query.tokens);
			this.#tokens = await this.#tokens;
		}
		return await this.#tokens[key];
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
						...this.#cookies2string(this.#init.post),
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
			...this.#cookies2string(this.#init.post),
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
				JSON.stringify(
					r?.login?.reason ?? r?.login?.result ?? r?.login ?? r
				)
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
			token: await this.getToken("csrf"),
		});
		this.#tokens = null;
		Object.keys(cookies).forEach(k => delete cookies[k]);
		Object.assign(cookies, this.#defaultCookie);
		return r;
	}
}

/** @class Rest */
class Rest {
	/** @type { URL["href"] } */
	#rest;
	/** @type { { get: RequestInit & { cookie: { string: string } }; post: RequestInit & { cookie: { string: string } }; put: RequestInit & { cookie: { string: string } } } } */
	#init;
	/** @type { { string: string } } */
	#defaultCookie = {};
	/**
	 * @param { { url: URL["href"]; cookie:{ string: string } } } config
	 */
	constructor({ rest, cookie = {} }) {
		rest = new URL(rest);
		rest.hash = "";
		rest.search = "";
		this.#rest = rest.href;
		const headers = {
			referer: rest.href,
			"user-agent": `${pack.name || ""}/${pack.version || ""} (+${
				pack.homepage || pack.repository?.url || pack?.bugs?.url || ""
			}; ${pack.bugs?.email || ""}) `,
			cookie: cookies,
		};
		this.#init = {
			head: { headers, method: "HEAD" },
			get: { headers },
			post: {
				headers: { ...headers, "Content-Type": "application/json" },
				method: "POST",
			},
			put: {
				headers: { ...headers, "Content-Type": "application/json" },
				method: "PUT",
			},
			delete: {
				headers: { ...headers, "Content-Type": "application/json" },
				method: "DELETE",
			},
		};
		this.#defaultCookie = cookie;
		Object.assign(cookies, this.#defaultCookie);
	}
	/**
	 * @private
	 * @param { Response<ApiResponse> } res
	 * @returns { Promise<any | string> }
	 */
	#parseRes(res) {
		res.headers
			.getSetCookie()
			.forEach(c => (cookies[c.split("=")[0]] = c.split(/[=;]/)[1]));
		return res.headers.get("content-type").split(";")[0] ===
			"application/json"
			? res.json()
			: res.text();
	}
	/**
	 * @private
	 * @param { RequestInit & { cookie: { string: string } } } init
	 * @returns { RequestInit }
	 */
	#cookies2string(init) {
		return Object.assign(Object.assign({}, init), {
			headers: Object.assign(Object.assign({}, init.headers), {
				cookie: Object.entries(init.headers.cookie)
					.map(([k, v]) => `${k}=${v}`)
					.join("; "),
			}),
		});
	}
	/**
	 * @param { string } path
	 * @param { URLSearchParams | string | Record<string, string | readonly string[]> | Iterable<[string, string]> | ReadonlyArray<[string, string]> } query
	 * @param { HeadersInit } [headers]
	 * @returns { Promise<Response> }
	 */
	async head(path, query, headers = {}) {
		return await fetch(
			`${this.#rest}${path}?${new URLSearchParams(query)}`,
			{ ...this.#init.head, ...headers }
		).then(res => {
			res.headers
				.getSetCookie()
				.forEach(c => (cookies[c.split("=")[0]] = c.split("=")[1]));
			return res;
		});
	}
	/**
	 * @param { string } path
	 * @param { URLSearchParams | string | Record<string, string | readonly string[]> | Iterable<[string, string]> | ReadonlyArray<[string, string]> } query
	 * @param { HeadersInit } [headers]
	 * @returns { Promise<RestResponse> }
	 */
	async get(path, query, headers = {}) {
		return await fetch(
			`${this.#rest}${path}?${new URLSearchParams(query)}`,
			{ ...this.#cookies2string(this.#init.get), ...headers }
		).then(this.#parseRes.bind(this));
	}
	/**
	 * @param { string } path
	 * @param { { string: any } } body
	 * @param { HeadersInit } [headers]
	 * @returns { Promise<RestResponse> }
	 */
	async post(path, body, headers = {}) {
		return await fetch(`${this.#rest}${path}`, {
			...this.#cookies2string(this.#init.post),
			...headers,
			body: JSON.stringify(body),
		}).then(this.#parseRes.bind(this));
	}
	/**
	 * @param { string } path
	 * @param { { string: any } } body
	 * @param { HeadersInit } [headers]
	 * @returns { Promise<RestResponse> }
	 */
	async put(path, body, headers = {}) {
		return await fetch(`${this.#rest}${path}`, {
			...this.#cookies2string(this.#init.put),
			...headers,
			body: JSON.stringify(body),
		}).then(this.#parseRes.bind(this));
	}
	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { HeadersInit } [headers]
	 * @returns { Promise<RestResponse> }
	 */
	async delete(path, body, headers = {}) {
		return await fetch(`${this.#rest}${path}`, {
			...this.#cookies2string(this.#init.delete),
			...headers,
			body: JSON.stringify(body),
		}).then(this.#parseRes.bind(this));
	}
}

/** @type { { Api: typeof Api; Rest: typeof Rest } } */
const mediaWiki = { Api, Rest };
module.exports = { mediaWiki, mw: mediaWiki };
