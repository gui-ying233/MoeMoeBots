"use strict";
/**
 * @module mediaWiki
 * @import { ApiResponse } from "types-mediawiki/mw/Api"
 * @import { RestResponse } from "types-mediawiki/mw/Rest"
 * @import { ApiLoginParams, ApiLogoutParams, ApiTokenType, UnknownApiParams, ApiParams, ApiFormatJsonParams } from "types-mediawiki-api"
 * @import { Tracer, Span, SpanOptions } from "@opentelemetry/api"
 * @typedef { Record<string, string> } Cookies
 * @typedef { { generation: number; defaults: Cookies; expires: Map<string, { value: string; at: number }> } } Session
 * @typedef { { response: Response; data: any; apiError: string | null; generation: number } } WikiResponse
 * @typedef { RequestInit & { headers: Record<string, string> } } WikiRequestInit
 * @typedef { URLSearchParams | string | Record<string, string | readonly string[]> | Iterable<[string, string]> | ReadonlyArray<[string, string]> } RestQuery
 */

const { ReadStream } = require("node:fs");
const { basename } = require("node:path");
const { setTimeout } = require("node:timers/promises");
require("node:tls").DEFAULT_CIPHERS = "DEFAULT@SECLEVEL=1";

/** @type { Tracer } */
const tracer = global.trace?.getTracer(
	__filename.slice(__dirname.length + 1),
) ?? {
	startActiveSpan: (...args) =>
		(args[2] ?? args[1])(new Proxy({}, { get: () => () => true })),
};
const SpanStatusCode = global.SpanStatusCode ?? { UNSET: 0, OK: 1, ERROR: 2 };
const ATTR_HTTP_RESPONSE_HEADER =
		global.ATTR_HTTP_RESPONSE_HEADER ??
		(key => `http.response.header.${key}`),
	ATTR_HTTP_RESPONSE_STATUS_CODE =
		global.ATTR_HTTP_RESPONSE_STATUS_CODE ?? "http.response.status_code";

/** @type { { name?: string; version?: string; homepage?: string; repository?: { url?: string }; bugs?: { url?: string; email?: string } } } */
const pack = require("./package.json");
const userAgent = `${pack.name || ""}/${pack.version || ""} (+${
	pack.homepage || pack.repository?.url || pack.bugs?.url || ""
}; ${pack.bugs?.email || ""}) `;

/**
 * @template T
 * @param { Span } span
 * @param { T } r
 * @param { string[] } [path]
 * @returns { T }
 */
const setSpanAttributes = (span, r, path = ["mw-response"]) => {
	const seen = new Set();
	/**
	 * @param { unknown } value
	 * @param { string } prefix
	 */
	const visit = (value, prefix) => {
		if (typeof value !== "object" || value === null || seen.has(value))
			return;
		seen.add(value);
		for (const [k, v] of Object.entries(value)) {
			if (v === null || v === undefined) continue;
			const key = k.toLowerCase();
			const name = `${prefix}.${k}`;
			if (key.endsWith("cookie"))
				span.setAttribute(
					name,
					typeof v === "object"
						? JSON.stringify(Object.keys(v))
						: typeof v,
				);
			else if (typeof v === "string")
				span.setAttribute(
					name,
					key.endsWith("password") || key.endsWith("token")
						? "string"
						: v,
				);
			else if (typeof v === "number" || typeof v === "boolean")
				span.setAttribute(name, v);
			else if (Array.isArray(v)) {
				try {
					const attribute = JSON.stringify(v);
					span.setAttribute(name, attribute);
				} catch {
					continue;
				}
			} else visit(v, name);
		}
		seen.delete(value);
	};
	visit(r, path.join("."));
	return r;
};

/**
 * @param { Span } span
 * @param { unknown } error
 */
const recordSpanError = (span, error) => {
	const exception = error instanceof Error ? error : String(error);
	span.setAttribute(
		"error.type",
		typeof exception === "string" ? "Error" : exception.name,
	);
	span.setStatus({
		code: SpanStatusCode.ERROR,
		message: typeof exception === "string" ? exception : exception.message,
	});
	span.recordException(exception);
};

/**
 * @template T
 * @param { string } name
 * @param { SpanOptions } options
 * @param { (span: Span) => Promise<T> } run
 * @returns { Promise<T> }
 */
const traceAsync = (name, options, run) =>
	tracer.startActiveSpan(name, options, async span => {
		try {
			return await run(span);
		} catch (e) {
			recordSpanError(span, e);
			throw e;
		} finally {
			span.end();
		}
	});

/** @type { WeakMap<Cookies, Session> } */
const sessions = new WeakMap();

/** @param { Cookies } cookie */
const getSession = cookie => {
	let session = sessions.get(cookie);
	if (!session) {
		session = { generation: 0, defaults: { ...cookie }, expires: new Map() };
		sessions.set(cookie, session);
	}
	return session;
};

/** @param { Cookies } cookie */
const pruneCookies = cookie => {
	const { defaults, expires } = getSession(cookie);
	const now = Date.now();
	for (const [name, { value, at }] of expires) {
		if (!Object.hasOwn(cookie, name) || cookie[name] !== value)
			expires.delete(name);
		else if (at <= now) {
			delete cookie[name];
			delete defaults[name];
			expires.delete(name);
		}
	}
};

/** @param { Cookies } cookie */
const cookieHeader = cookie => {
	pruneCookies(cookie);
	return Object.entries(cookie)
		.map(([k, v]) => `${k}=${v}`)
		.join("; ");
};

/**
 * @param { string } name
 * @param { SpanOptions } options
 * @param { WikiRequestInit } init
 * @param { Cookies } cookie
 * @returns { RequestInit }
 */
const cookies2string = (name, options, init, cookie) =>
	tracer.startActiveSpan(name, options, span => {
		try {
			const result = {
				...init,
				headers: { ...init.headers, cookie: cookieHeader(cookie) },
			};
			setSpanAttributes(
				span,
				{ ...init, headers: { ...init.headers, cookie } },
				["init"],
			);
			span.setStatus({ code: SpanStatusCode.OK });
			return result;
		} catch (e) {
			recordSpanError(span, e);
			throw e;
		} finally {
			span.end();
		}
	});

/**
 * @param { Headers } headers
 * @param { Cookies } [cookie]
 * @returns { string[] }
 */
const readCookies = (headers, cookie) => {
	const names = [];
	const session = cookie && getSession(cookie);
	const now = Date.now();
	for (const header of headers.getSetCookie()) {
		const [pair, ...attributes] = header.split(";");
		const separator = pair.indexOf("=");
		if (separator < 0) continue;
		const name = pair.slice(0, separator).trim();
		if (!name) continue;
		names.push(name);
		if (!session) continue;

		const value = pair.slice(separator + 1).trim();
		let maxAge;
		let expires = Infinity;
		for (const attribute of attributes) {
			const [key, raw = ""] = attribute.split("=", 2);
			const attr = key.trim().toLowerCase();
			if (attr === "max-age" && /^-?\d+$/.test(raw.trim()))
				maxAge = Number(raw);
			else if (attr === "expires") {
				const time = Date.parse(raw);
				if (Number.isFinite(time)) expires = time;
			}
		}
		const at = maxAge === undefined ? expires : now + maxAge * 1000;
		session.expires.delete(name);
		if (at <= now) {
			delete cookie[name];
			delete session.defaults[name];
		} else {
			if (Object.hasOwn(cookie, name)) cookie[name] = value;
			else
				Object.defineProperty(cookie, name, {
					value,
					enumerable: true,
					writable: true,
					configurable: true,
				});
			if (Number.isFinite(at)) session.expires.set(name, { value, at });
		}
	}
	return names;
};

/**
 * @param { Span } span
 * @param { Response } res
 * @param { string | null } [apiError]
 */
const setResponseStatus = (span, res, apiError) => {
	span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, res.status);
	const error = res.status >= 400 ? String(res.status) : apiError;
	if (error) {
		span.setAttribute("error.type", error);
		span.setStatus({
			code: SpanStatusCode.ERROR,
			message: (res.status >= 400 && res.statusText) || error,
		});
	}
};

/**
 * @param { Span } span
 * @param { Headers } headers
 * @param { Cookies } [cookie]
 */
const setResponseHeaders = (span, headers, cookie) => {
	for (const [k, v] of headers)
		if (k !== "set-cookie") span.setAttribute(ATTR_HTTP_RESPONSE_HEADER(k), v);
	span.setAttribute(
		ATTR_HTTP_RESPONSE_HEADER("set-cookie"),
		JSON.stringify(readCookies(headers, cookie)),
	);
};

/** @param { any } data */
const apiErrorCode = data => {
	const code = data?.error?.code ?? data?.errors?.[0]?.code;
	if (typeof code === "string" && code) return code;
	return data?.error || data?.errors?.length ? "MediaWiki-API-Error" : null;
};

/** @param { unknown } value */
const hasParameterValue = value => value !== false && value != null;

/** @param { UnknownApiParams | RestQuery } [parameters] */
const toSearchParams = parameters =>
	new URLSearchParams(
		/** @type { ConstructorParameters<typeof URLSearchParams>[0] } */ (parameters),
	);

/**
 * @param { string } url
 * @param { RequestInit } init
 * @param { Cookies } cookie
 * @param { Span } requestSpan
 * @param { SpanOptions } options
 * @param { "Api" | "Rest" } [client]
 * @returns { Promise<WikiResponse> }
 */
const fetchResponse = async (url, init, cookie, requestSpan, options, client) => {
	const session = getSession(cookie);
	const generation = session.generation;
	const response = await fetch(url, init);
	const responseCookie = generation === session.generation ? cookie : undefined;
	requestSpan.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
	if (!client) {
		setResponseHeaders(requestSpan, response.headers, responseCookie);
		return { response, data: response, apiError: null, generation };
	}

	return await traceAsync(`mediaWiki.${client}.#parseRes`, options, async span => {
		let apiError =
			client === "Api" ? response.headers.get("MediaWiki-API-Error") : null;
		setResponseStatus(span, response, apiError);
		setResponseHeaders(span, response.headers, responseCookie);
		const contentType = response.headers
			.get("content-type")
			?.split(";")[0].trim().toLowerCase();
		const data =
			contentType === "application/json" &&
			![204, 205, 304].includes(response.status)
				? await response.json()
				: await response.text();
		if (client === "Api" && !apiError) {
			apiError = apiErrorCode(data);
			if (apiError) setResponseStatus(span, response, apiError);
		}
		return { response, data, apiError, generation };
	});
};

/** @class Api */
class Api {
	/** @type { URL["href"] } */
	#api;
	/** @type { string } */
	#botUsername;
	/** @type { string } */
	#botPassword;
	/** @type { { get: WikiRequestInit; post: WikiRequestInit } } */
	#init;
	/** @type { { format: ApiParams["format"]; errorsuselocal: ApiParams["errorsuselocal"]; utf8: ApiFormatJsonParams["utf8"]; formatversion: ApiFormatJsonParams["formatversion"] | number } } */
	#parameters = {
		format: "json",
		errorsuselocal: true,
		utf8: true,
		formatversion: 2,
	};
	/** @type { Record<`${ApiTokenType}token`, string> | Promise<Record<`${ApiTokenType}token`, string>> | null } */
	#tokens = null;
	/** @type { string } */
	#tokenCookie;
	/** @type { number } */
	#tokenGeneration;
	/** @type { Cookies } */
	#cookie;
	/** @type { SpanOptions } */
	#span;
	/**
	 * @param { { api: URL["href"]; botUsername: string; botPassword: string; cookie?: Cookies } } config
	 */
	constructor({ api, botUsername, botPassword, cookie = {} }) {
		tracer.startActiveSpan("mediaWiki.Api.constructor", span => {
			try {
				setSpanAttributes(span, { api, botUsername, botPassword, cookie }, [
					"params",
				]);
				const url = new URL(api);
				url.hash = "";
				url.search = "";
				this.#api = url.href;
				this.#cookie = cookie;
				const session = getSession(cookie);
				const headers = { referer: url.href, "user-agent": userAgent };
				this.#init = {
					get: { headers },
					post: { headers, method: "POST" },
				};
				this.#botUsername = botUsername;
				this.#botPassword = botPassword;
				setSpanAttributes(
					span,
					{
						"#api": this.#api,
						"#botUsername": this.#botUsername,
						"#botPassword": this.#botPassword,
						"#init": this.#init,
						"#defaultCookie": session.defaults,
					},
					["this"],
				);
				this.#span = { links: [{ context: span.spanContext() }] };
				span.setStatus({ code: SpanStatusCode.OK });
			} catch (e) {
				recordSpanError(span, e);
				throw e;
			} finally {
				span.end();
			}
		});
	}

	/**
	 * @param { UnknownApiParams } parameters
	 * @returns { ApiParams }
	 */
	#listToPipe(parameters) {
		return tracer.startActiveSpan("mediaWiki.Api.#listToPipe", this.#span, span => {
			try {
				setSpanAttributes(span, parameters, ["params"]);
				const result = Object.fromEntries(
					Object.entries({ ...this.#parameters, ...parameters })
						.filter(
							([k, v]) =>
								k === "format" ||
								k === "formatversion" ||
								hasParameterValue(v),
						)
						.map(([k, v]) => [k, Array.isArray(v) ? v.join("|") : v]),
				);
				setSpanAttributes(span, result, ["params"]);
				span.setStatus({ code: SpanStatusCode.OK });
				return result;
			} catch (e) {
				recordSpanError(span, e);
				throw e;
			} finally {
				span.end();
			}
		});
	}

	/**
	 * @param { string } url
	 * @param { "get" | "post" } method
	 * @param { Span } span
	 * @param { RequestInit["body"] } [body]
	 */
	#request(url, method, span, body) {
		const init = cookies2string(
			"mediaWiki.Api.#cookies2string",
			this.#span,
			this.#init[method],
			this.#cookie,
		);
		return fetchResponse(
			url, { ...init, body }, this.#cookie, span, this.#span, "Api",
		);
	}

	/**
	 * @param { ApiParams } parameters
	 * @returns { Promise<ApiResponse | string> }
	 */
	async get(parameters) {
		return traceAsync("mediaWiki.Api.get", this.#span, async span => {
			setSpanAttributes(span, parameters, ["params"]);
			const query = toSearchParams(this.#listToPipe(parameters));
			const { response, data, apiError } = await this.#request(
				`${this.#api}?${query}`,
				"get",
				span,
			);
			setResponseStatus(span, response, apiError);
			return data;
		});
	}

	/**
	 * @param { ApiTokenType } [type]
	 * @param { boolean } [newToken]
	 * @returns { Promise<string> }
	 */
	async getToken(type = "csrf", newToken = false) {
		return traceAsync("mediaWiki.Api.getToken", this.#span, async span => {
			setSpanAttributes(span, { type, newToken }, ["params"]);
			if (typeof type !== "string") throw new TypeError("types");

			const key = `${type}token`;
			const { generation } = getSession(this.#cookie);
			let tokens = this.#tokenGeneration === generation ? this.#tokens : null;
			if (!(tokens instanceof Promise)) {
				const cookie = cookieHeader(this.#cookie);
				if (
					newToken ||
					this.#tokenCookie !== cookie ||
					!tokens?.[key] ||
					tokens[key] === "+\\"
				) {
					const request = this.get({
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
					}).then(r => {
						setSpanAttributes(span, r);
						const result = typeof r === "object" ? r?.query?.tokens : undefined;
						if (!result || typeof result !== "object")
							throw new TypeError("tokens");
						return result;
					});
					const pending = request.then(
						result => {
							if (this.#tokens === pending) this.#tokens = result;
							return result;
						},
						e => {
							if (this.#tokens === pending) this.#tokens = null;
							throw e;
						},
					);
					this.#tokenGeneration = generation;
					this.#tokenCookie = cookie;
					this.#tokens = tokens = pending;
				}
			}
			const token = (await tokens)[key];
			span.setStatus({ code: SpanStatusCode.OK });
			return token;
		});
	}

	/**
	 * @param { string } url
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @returns { Promise<WikiResponse> }
	 */
	#upload(url, parameters) {
		return traceAsync("mediaWiki.Api.post.upload", this.#span, async span => {
			const { file, filesize, stash, ...params } = parameters;
			if (!(file instanceof ReadStream)) throw new TypeError("file");
			delete params.offset;
			delete params.filekey;
			delete params.sessionkey;

			let token = params.token;
			/**
			 * @param { Span } span
			 * @param { UnknownApiParams } fields
			 * @param { ["file" | "chunk", Blob] } [part]
			 */
			const send = async (span, fields, part) => {
				const upload = () => {
					const values = this.#listToPipe({ ...fields, token });
					setSpanAttributes(span, values, ["params"]);
					if (!part)
						return this.#request(
							url,
							"post",
							span,
							toSearchParams(values),
						);
					const body = new FormData();
					for (const [key, value] of Object.entries(values))
						body.append(key, value);
					body.append(...part);
					return this.#request(url, "post", span, body);
				};
				let reply = await upload();
				if (
					reply.apiError === "badtoken" ||
					apiErrorCode(reply.data) === "badtoken"
				) {
					console.warn("badtoken");
					token = await this.getToken("csrf", true);
					reply = await upload();
				}
				setResponseStatus(span, reply.response, reply.apiError);
				return reply;
			};

			try {
				const size = filesize == null ? undefined : Number(filesize);
				if (size !== undefined && (!Number.isSafeInteger(size) || size < 0))
					throw new RangeError("filesize");
				if (!params.filename && file.path)
					params.filename = basename(file.path.toString());

				if (size === undefined || size <= file.readableHighWaterMark) {
					const chunks = [];
					for await (const chunk of file) chunks.push(chunk);
					const blob = new Blob(chunks);
					if (size !== undefined && size !== blob.size)
						throw new RangeError("filesize");
					return await send(span, { ...params, filesize, stash }, ["file", blob]);
				}

				let offset = 0;
				/** @type { string | undefined } */
				let filekey;
				let reply;
				for await (const chunk of file) {
					const blob = new Blob([chunk]);
					const next = offset + blob.size;
					if (next > size) throw new RangeError("filesize");
					reply = await traceAsync(
						"mediaWiki.Api.post.upload.chunk",
						this.#span,
						async span => {
							const reply = await send(
								span,
								{
									...params,
									text: undefined,
									autotext: undefined,
									stash: true,
									filesize: size,
									offset,
									filekey,
								},
								["chunk", blob],
							);
							const upload = reply.data?.upload;
							const expected =
								next === size
									? ["Success", "Poll"].includes(upload?.result)
									: upload?.result === "Continue" &&
										Number(upload.offset) === next;
							if (
								reply.response.ok &&
								!reply.apiError &&
								upload?.filekey &&
								expected
							)
								return reply;
							throw new Error(JSON.stringify(reply.data?.error ?? reply.data));
						},
					);
					offset = next;
					filekey = reply.data.upload.filekey;
				}
				if (!reply || offset !== size) throw new RangeError("filesize");

				for (
					let i = 0;
					i < 60 &&
					reply.response.ok &&
					!reply.apiError &&
					reply.data?.upload?.result === "Poll";
					i++
				) {
					await setTimeout(1000);
					reply = await send(span, {
						...params,
						async: undefined,
						checkstatus: true,
						filekey,
					});
				}

				if (
					!reply.response.ok ||
					reply.apiError ||
					reply.data?.upload?.result !== "Success" ||
					!reply.data.upload.filekey
				)
					throw new Error(JSON.stringify(reply.data?.error ?? reply.data));

				if (hasParameterValue(stash)) {
					setResponseStatus(span, reply.response, reply.apiError);
					return reply;
				}
				return await send(span, { ...params, filekey: reply.data.upload.filekey });
			} finally {
				if (!file.destroyed) file.destroy();
			}
		});
	}

	/**
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @returns { Promise<WikiResponse> }
	 */
	#post(parameters) {
		return traceAsync("mediaWiki.Api.post", this.#span, async span => {
			const url = new URL(this.#api);
			if (parameters.origin) {
				const { origin, ...body } = parameters;
				url.searchParams.set("origin", origin);
				parameters = body;
			}

			let reply;
			if (parameters.action === "upload" && parameters.file)
				reply = await this.#upload(url.href, parameters);
			else {
				setSpanAttributes(span, parameters, ["params"]);
				const body = toSearchParams(this.#listToPipe(parameters));
				reply = await this.#request(url.href, "post", span, body);
			}
			setResponseStatus(span, reply.response, reply.apiError);
			return reply;
		});
	}

	/**
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @returns { Promise<ApiResponse | string> }
	 */
	async post(parameters) {
		return (await this.#post(parameters)).data;
	}

	/**
	 * @param { ApiLoginParams["lgname"] } lgname
	 * @param { ApiLoginParams["lgpassword"] } lgpassword
	 * @returns { Promise<ApiResponse> }
	 */
	#login(lgname, lgpassword) {
		return traceAsync("mediaWiki.Api.#login", this.#span, async span => {
			const session = getSession(this.#cookie);
			/** @param { ApiLoginParams["lgtoken"] } lgtoken */
			const send = lgtoken =>
				this.#post({
					action: "login",
					...setSpanAttributes(span, { lgname, lgpassword, lgtoken }, [
						"params",
					]),
				});
			let reply = await send(await this.getToken("login"));
			if (
				reply.generation === session.generation &&
				reply.response.ok &&
				!reply.apiError &&
				reply.data?.login?.result === "NeedToken"
			)
				reply = await send(
					reply.data.login.token ?? (await this.getToken("login", true)),
				);

			const r = setSpanAttributes(span, reply.data);
			if (reply.response.ok && !reply.apiError && r?.login?.result === "Success") {
				if (reply.generation === session.generation) {
					session.generation++;
					this.#tokens = null;
				}
				span.setStatus({ code: SpanStatusCode.OK });
				return r;
			}
			throw new Error(
				JSON.stringify(r?.login?.reason ?? r?.login?.result ?? r?.login ?? r?.error ?? r),
			);
		});
	}

	/**
	 * @param { ApiLoginParams["lgname"] } [lgname]
	 * @param { ApiLoginParams["lgpassword"] } [lgpassword]
	 * @returns { Promise<ApiResponse> }
	 */
	async login(lgname = this.#botUsername, lgpassword = this.#botPassword) {
		return traceAsync("mediaWiki.Api.login", this.#span, async span => {
			setSpanAttributes(span, { lgname, lgpassword }, ["params"]);
			const r = await this.#login(lgname, lgpassword);
			setSpanAttributes(span, r);
			span.setStatus({ code: SpanStatusCode.OK });
			return r;
		});
	}

	/**
	 * @param { ApiLogoutParams["token"] } [token]
	 * @returns { Promise<ApiResponse | string> }
	 */
	async logout(token) {
		return traceAsync("mediaWiki.Api.logout", this.#span, async span => {
			token = token ?? (await this.getToken("csrf"));
			const { response, data: r, apiError, generation } =
				await this.#post({ action: "logout", token });
			setSpanAttributes(span, r);
			const empty = r === "" ||
				(r !== null && typeof r === "object" && !Object.keys(r).length);
			if (!response.ok || apiError || !empty)
				throw new Error(JSON.stringify(r?.error ?? r));

			const session = getSession(this.#cookie);
			if (generation === session.generation) {
				pruneCookies(this.#cookie);
				session.generation++;
				session.expires.clear();
				this.#tokens = null;
				for (const name of Object.keys(this.#cookie)) delete this.#cookie[name];
				Object.assign(this.#cookie, session.defaults);
			}
			span.setStatus({ code: SpanStatusCode.OK });
			return r;
		});
	}

	get cookie() {
		pruneCookies(this.#cookie);
		return this.#cookie;
	}
}

/** @class Rest */
class Rest {
	/** @type { URL["href"] } */
	#rest;
	/** @type { Record<"head" | "get" | "post" | "put" | "delete", WikiRequestInit> } */
	#init;
	/** @type { Cookies } */
	#cookie;
	/** @type { SpanOptions } */
	#span;
	/**
	 * @param { { rest: URL["href"]; cookie?: Cookies } } config
	 */
	constructor({ rest, cookie = {} }) {
		tracer.startActiveSpan("mediaWiki.Rest.constructor", span => {
			try {
				setSpanAttributes(span, { rest, cookie }, ["params"]);
				const url = new URL(rest);
				url.hash = "";
				url.search = "";
				this.#rest = url.href;
				this.#cookie = cookie;
				const session = getSession(cookie);
				const headers = {
					referer: url.href,
					"user-agent": userAgent,
					"Api-User-Agent": userAgent,
				};
				const jsonHeaders = { ...headers, "Content-Type": "application/json" };
				this.#init = {
					head: { headers, method: "HEAD" },
					get: { headers },
					post: { headers: jsonHeaders, method: "POST" },
					put: { headers: jsonHeaders, method: "PUT" },
					delete: { headers: jsonHeaders, method: "DELETE" },
				};
				setSpanAttributes(
					span,
					{
						"#rest": this.#rest,
						"#init": this.#init,
						"#defaultCookie": session.defaults,
					},
					["this"],
				);
				this.#span = { links: [{ context: span.spanContext() }] };
				span.setStatus({ code: SpanStatusCode.OK });
			} catch (e) {
				recordSpanError(span, e);
				throw e;
			} finally {
				span.end();
			}
		});
	}

	/**
	 * @param { "head" | "get" | "post" | "put" | "delete" } method
	 * @param { string } path
	 * @param { { query?: RestQuery; body?: any } } parameters
	 * @param { RequestInit } overrides
	 */
	#request(method, path, parameters, overrides) {
		return traceAsync(`mediaWiki.Rest.${method}`, this.#span, async span => {
			setSpanAttributes(span, { path, ...parameters }, ["params"]);
			const reads = method === "head" || method === "get";
			const url = reads
				? `${this.#rest}${path}?${toSearchParams(parameters.query)}`
				: `${this.#rest}${path}`;
			const init = {
				...cookies2string(
					"mediaWiki.Rest.#cookies2string",
					this.#span,
					this.#init[method],
					this.#cookie,
				),
				...overrides,
			};
			if (!reads) init.body = JSON.stringify(parameters.body);
			const { response, data, apiError } = await fetchResponse(
				url,
				init,
				this.#cookie,
				span,
				this.#span,
				method === "head" ? undefined : "Rest",
			);
			setResponseStatus(span, response, apiError);
			return data;
		});
	}

	/**
	 * @param { string } path
	 * @param { RestQuery } query
	 * @param { RequestInit } [headers]
	 * @returns { Promise<Response> }
	 */
	async head(path, query, headers = {}) {
		return this.#request("head", path, { query }, headers);
	}

	/**
	 * @param { string } path
	 * @param { RestQuery } query
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async get(path, query, headers = {}) {
		return this.#request("get", path, { query }, headers);
	}

	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async post(path, body, headers = {}) {
		return this.#request("post", path, { body }, headers);
	}

	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async put(path, body, headers = {}) {
		return this.#request("put", path, { body }, headers);
	}

	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async delete(path, body, headers = {}) {
		return this.#request("delete", path, { body }, headers);
	}

	get cookie() {
		pruneCookies(this.#cookie);
		return this.#cookie;
	}
}

/** @type { { Api: typeof Api; Rest: typeof Rest } } */
const mediaWiki = { Api, Rest };
module.exports = {
	mediaWiki,
	mw: mediaWiki,
	tracer,
	SpanStatusCode,
	setSpanAttributes,
};
