"use strict";
/**
 * @module mediaWiki
 * @import { ApiResponse } from "types-mediawiki/mw/Api"
 * @import { RestResponse } from "types-mediawiki/mw/Rest"
 * @import { ApiLoginParams, ApiLogoutParams, ApiTokenType, UnknownApiParams, ApiParams, ApiFormatJsonParams } from "types-mediawiki-api"
 * @import { Tracer, Span, SpanOptions } from "@opentelemetry/api"
 * @typedef { Record<string, string> } Cookies
 * @typedef { { cookie: Cookies; generation: number; defaults: Cookies; expires: Map<string, { value: string; at: number }> } } Session
 * @typedef { { response: Response; data: any; apiError: string | null; generation: number } } WikiResponse
 * @typedef { Omit<RequestInit, "headers"> & { headers: { referer: string; "user-agent": string; "Api-User-Agent"?: string; "Content-Type"?: string; cookie: Cookies } } } WikiRequestInit
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
		global.ATTR_HTTP_RESPONSE_STATUS_CODE ?? "http.response.status_code",
	ATTR_HTTP_REQUEST_RESEND_COUNT =
		global.ATTR_HTTP_REQUEST_RESEND_COUNT ?? "http.request.resend_count";

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
					key.endsWith("password") ||
						key.endsWith("token") ||
						key.endsWith("authorization") ||
						key === "x-api-key"
						? "string"
						: v,
				);
			else if (typeof v === "number" || typeof v === "boolean")
				span.setAttribute(name, v);
			else if (
				prefix === "params.headers" &&
				key === "headers" &&
				(v instanceof Headers || Array.isArray(v))
			) {
				try {
					visit(Object.fromEntries(v), name);
				} catch {
					continue;
				}
			} else if (Array.isArray(v)) {
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

/** @type { WeakMap<Cookies, Session> } */
const sessions = new WeakMap();
const postWithResponse = Symbol();

/** @param { Cookies } cookie */
const getSession = cookie =>
	tracer.startActiveSpan("mediaWiki.getSession", span => {
		try {
			let session = sessions.get(cookie);
			span.setAttribute("mediawiki.session.reused", session !== undefined);
			if (!session) {
				session = {
					cookie,
					generation: 0,
					defaults: { ...cookie },
					expires: new Map(),
				};
				sessions.set(cookie, session);
			}
			span.setAttribute("mediawiki.session.generation", session.generation);
			setSpanAttributes(span, { cookie }, ["params"]);
			span.setStatus({ code: SpanStatusCode.OK });
			return session;
		} catch (e) {
			recordSpanError(span, e);
			throw e;
		} finally {
			span.end();
		}
	});

/** @param { Session } session */
const pruneCookies = ({ cookie, defaults, expires, generation }) =>
	tracer.startActiveSpan("mediaWiki.pruneCookies", span => {
		try {
			const expired = [];
			const now = Date.now();
			for (const [name, { value, at }] of expires) {
				if (!Object.hasOwn(cookie, name) || cookie[name] !== value)
					expires.delete(name);
				else if (at <= now) {
					delete cookie[name];
					delete defaults[name];
					expires.delete(name);
					expired.push(name);
				}
			}
			span.setAttribute("mediawiki.session.generation", generation);
			span.setAttribute("mediawiki.cookie.expired_names", expired);
			span.setStatus({ code: SpanStatusCode.OK });
		} catch (e) {
			recordSpanError(span, e);
			throw e;
		} finally {
			span.end();
		}
	});

/**
 * @param { Headers } headers
 * @param { Session } session
 * @param { number } generation
 * @returns { string[] }
 */
const readCookies = (headers, session, generation) =>
	tracer.startActiveSpan("mediaWiki.readCookies", span => {
		try {
			const names = [];
			const expired = [];
			const current = generation === session.generation;
			span.setAttribute("mediawiki.session.generation", session.generation);
			const { cookie, defaults, expires } = session;
			const now = Date.now();
			for (const header of headers.getSetCookie()) {
				const [pair, ...attributes] = header.split(";");
				const separator = pair.indexOf("=");
				if (separator < 0) continue;
				const name = pair.slice(0, separator).trim();
				if (!name) continue;
				names.push(name);
				if (!current) continue;

				const value = pair.slice(separator + 1).trim();
				let maxAge;
				let expiry = Infinity;
				for (const attribute of attributes) {
					const [key, raw = ""] = attribute.split("=", 2);
					const attr = key.trim().toLowerCase();
					if (attr === "max-age" && /^-?\d+$/.test(raw.trim()))
						maxAge = Number(raw);
					else if (attr === "expires") {
						const time = Date.parse(raw);
						if (Number.isFinite(time)) expiry = time;
					}
				}
				const at = maxAge === undefined ? expiry : now + maxAge * 1000;
				expires.delete(name);
				if (at <= now) {
					delete cookie[name];
					delete defaults[name];
					expired.push(name);
				} else {
					if (Object.hasOwn(cookie, name)) cookie[name] = value;
					else
						Object.defineProperty(cookie, name, {
							value,
							enumerable: true,
							writable: true,
							configurable: true,
						});
					if (Number.isFinite(at)) expires.set(name, { value, at });
				}
			}
			span.setAttribute("mediawiki.cookie.names", names);
			span.setAttribute("mediawiki.cookie.expired_names", expired);
			span.setAttribute("mediawiki.cookie.applied", current && names.length > 0);
			span.setStatus({ code: SpanStatusCode.OK });
			return names;
		} catch (e) {
			recordSpanError(span, e);
			throw e;
		} finally {
			span.end();
		}
	});

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
 * @param { string[] } cookieNames
 */
const setResponseHeaders = (span, headers, cookieNames) => {
	for (const [k, v] of headers)
		if (k !== "set-cookie") span.setAttribute(ATTR_HTTP_RESPONSE_HEADER(k), v);
	span.setAttribute(
		ATTR_HTTP_RESPONSE_HEADER("set-cookie"),
		JSON.stringify(cookieNames),
	);
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
	/** @type { Session } */
	#session;
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
				this.#session = getSession(cookie);
				const headers = { referer: url.href, "user-agent": userAgent, cookie };
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
						"#defaultCookie": this.#session.defaults,
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
		return tracer.startActiveSpan(
			"mediaWiki.Api.#listToPipe",
			this.#span,
			span => {
				try {
					setSpanAttributes(span, parameters, ["params"]);
					const result = Object.fromEntries(
						Object.entries({ ...this.#parameters, ...parameters })
							.filter(
								([k, v]) =>
									k === "format" ||
									k === "formatversion" ||
									(v !== false && v != null),
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
			},
		);
	}

	/**
	 * @param { WikiRequestInit } init
	 * @returns { RequestInit }
	 */
	#cookies2string(init) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.#cookies2string",
			this.#span,
			span => {
				try {
					pruneCookies(this.#session);
					const cookie = Object.entries(this.#session.cookie)
						.map(([name, value]) => `${name}=${value}`)
						.join("; ");
					setSpanAttributes(span, init, ["init"]);
					const result = { ...init, headers: { ...init.headers, cookie } };
					span.setStatus({ code: SpanStatusCode.OK });
					return result;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { Response } response
	 * @param { number } generation
	 * @returns { Promise<WikiResponse> }
	 */
	#parseRes(response, generation) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.#parseRes",
			this.#span,
			async span => {
				try {
					let apiError = response.headers.get("MediaWiki-API-Error");
					setResponseStatus(span, response, apiError);
					const cookieNames = readCookies(response.headers, this.#session, generation);
					setResponseHeaders(span, response.headers, cookieNames);
					const contentType = response.headers
						.get("content-type")
						?.split(";")[0].trim().toLowerCase();
					const json = contentType === "application/json" &&
						![204, 205, 304].includes(response.status);
					span.setAttribute("mediawiki.response.body_type", json ? "json" : "text");
					const data = json
						? /** @type { ApiResponse } */ (await response.json())
						: await response.text();
					if (!apiError && data && typeof data === "object") {
						const code = data?.error?.code ?? data?.errors?.[0]?.code;
						if (typeof code === "string" && code) apiError = code;
						else if (data?.error || data?.errors?.length)
							apiError = "MediaWiki-API-Error";
						if (apiError) setResponseStatus(span, response, apiError);
					}
					if (apiError) span.setAttribute("mediawiki.api.error_code", apiError);
					return { response, data, apiError, generation };
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { ApiParams } parameters
	 * @returns { Promise<ApiResponse | string> }
	 */
	async get(parameters) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.get",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, parameters, ["params"]);
					span.setAttribute("http.request.method", "GET");
					const query = new URLSearchParams(
						/** @type { Record<string, string> } */ (this.#listToPipe(parameters)),
					);
					const init = this.#cookies2string(this.#init.get);
					const generation = this.#session.generation;
					const response = await fetch(
						`${this.#api}?${query}`,
						init,
					);
					span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
					const { data, apiError } = await this.#parseRes(response, generation);
					setResponseStatus(span, response, apiError);
					return data;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { ApiTokenType } [type]
	 * @param { boolean } [newToken]
	 * @returns { Promise<string> }
	 */
	async getToken(type = "csrf", newToken = false) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.getToken",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { type, newToken }, ["params"]);
					if (typeof type !== "string") throw new TypeError("types");

					const key = `${type}token`;
					const { generation } = this.#session;
					span.setAttribute("mediawiki.session.generation", generation);
					let tokens = this.#tokenGeneration === generation ? this.#tokens : null;
					if (tokens instanceof Promise) span.setAttribute("mediawiki.token.cache", "pending");
					else {
						pruneCookies(this.#session);
						const cookie = Object.entries(this.#session.cookie)
							.map(([name, value]) => `${name}=${value}`)
							.join("; ");
						if (
							newToken ||
							this.#tokenCookie !== cookie ||
							!tokens?.[key] ||
							tokens[key] === "+\\"
						) {
							span.setAttribute("mediawiki.token.cache", "miss");
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
						} else span.setAttribute("mediawiki.token.cache", "hit");
					}
					const token = (await tokens)[key];
					span.setStatus({ code: SpanStatusCode.OK });
					return token;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { string } url
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @returns { Promise<WikiResponse> }
	 */
	#upload(url, parameters) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.post.upload",
			this.#span,
			async span => {
				try {
					const { file, filesize, stash, ...params } = parameters;
					setSpanAttributes(span, { ...params, filesize, stash }, ["params"]);
					if (!(file instanceof ReadStream)) throw new TypeError("file");
					delete params.offset;
					delete params.filekey;
					delete params.sessionkey;

					let token = params.token;
					/**
					 * @param { UnknownApiParams } fields
					 * @param { ["file" | "chunk", Blob] } [part]
					 */
					const send = (fields, part) =>
						tracer.startActiveSpan(
							"mediaWiki.Api.post.upload.send",
							this.#span,
							async span => {
								try {
									span.setAttribute("http.request.method", "POST");
									for (let attempt = 0; ; attempt++) {
										const values = this.#listToPipe({ ...fields, token });
										setSpanAttributes(span, values, ["params"]);
										let body;
										if (part) {
											body = new FormData();
											for (const [key, value] of Object.entries(values))
												body.append(key, value);
											body.append(...part);
											span.setAttribute("mediawiki.upload.part_size", part[1].size);
										} else {
											body = new URLSearchParams(
												/** @type { Record<string, string> } */ (values),
											);
										}

										const init = this.#cookies2string(this.#init.post);
										const generation = this.#session.generation;
										if (attempt) span.setAttribute(ATTR_HTTP_REQUEST_RESEND_COUNT, attempt);
										const response = await fetch(url, { ...init, body });
										span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
										const reply = await this.#parseRes(response, generation);
										const badToken = reply.apiError === "badtoken" ||
											(reply.data?.error?.code ?? reply.data?.errors?.[0]?.code) === "badtoken";
										if (attempt || !badToken) {
											setResponseStatus(span, response, reply.apiError);
											setSpanAttributes(span, { result: reply.data?.upload?.result }, ["upload"]);
											return reply;
										}

										span.addEvent("mediawiki.upload.retry", { "error.type": "badtoken" });
										console.warn("badtoken");
										token = await this.getToken("csrf", true);
									}
								} catch (e) {
									recordSpanError(span, e);
									throw e;
								} finally {
									span.end();
								}
							},
						);

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
							const reply = await send({ ...params, filesize, stash }, ["file", blob]);
							setResponseStatus(span, reply.response, reply.apiError);
							return reply;
						}

						let offset = 0;
						/** @type { string | undefined } */
						let filekey;
						let reply;
						for await (const chunk of file) {
							const blob = new Blob([chunk]);
							const next = offset + blob.size;
							if (next > size) throw new RangeError("filesize");
							reply = await tracer.startActiveSpan(
								"mediaWiki.Api.post.upload.chunk",
								this.#span,
								async span => {
									try {
										const reply = await send(
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
										setResponseStatus(span, reply.response, reply.apiError);
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
									} catch (e) {
										recordSpanError(span, e);
										throw e;
									} finally {
										span.end();
									}
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
							reply = await send({
								...params,
								async: undefined,
								checkstatus: true,
								filekey,
							});
							setResponseStatus(span, reply.response, reply.apiError);
						}

						if (
							!reply.response.ok ||
							reply.apiError ||
							reply.data?.upload?.result !== "Success" ||
							!reply.data.upload.filekey
						)
							throw new Error(JSON.stringify(reply.data?.error ?? reply.data));

						if (stash === false || stash == null) {
							reply = await send({ ...params, filekey: reply.data.upload.filekey });
						}
						setResponseStatus(span, reply.response, reply.apiError);
						return reply;
					} finally {
						if (!file.destroyed) file.destroy();
					}
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @overload
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @returns { Promise<ApiResponse | string> }
	 */
	/**
	 * @overload
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @param { typeof postWithResponse } mode
	 * @returns { Promise<WikiResponse> }
	 */
	/**
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @param { typeof postWithResponse } [mode]
	 * @returns { Promise<WikiResponse | ApiResponse | string> }
	 */
	async post(parameters, mode = undefined) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.post",
			this.#span,
			async span => {
				try {
					span.setAttribute("http.request.method", "POST");
					const url = new URL(this.#api);
					if (parameters.origin) {
						const { origin, ...body } = parameters;
						url.searchParams.set("origin", origin);
						parameters = body;
					}

					const { file, ...fields } = parameters;
					setSpanAttributes(span, fields, ["params"]);
					let reply;
					if (parameters.action === "upload" && file)
						reply = await this.#upload(url.href, parameters);
					else {
						const body = new URLSearchParams(
							/** @type { Record<string, string> } */ (this.#listToPipe(parameters)),
						);
						const init = this.#cookies2string(this.#init.post);
						const generation = this.#session.generation;
						const response = await fetch(url.href, { ...init, body });
						span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
						reply = await this.#parseRes(response, generation);
					}
					setResponseStatus(span, reply.response, reply.apiError);
					return mode === postWithResponse ? reply : reply.data;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { ApiLoginParams["lgname"] } lgname
	 * @param { ApiLoginParams["lgpassword"] } lgpassword
	 * @returns { Promise<ApiResponse> }
	 */
	#login(lgname, lgpassword) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.#login",
			this.#span,
			async span => {
				try {
					const session = this.#session;
					let lgtoken = await this.getToken("login");
					let reply;
					for (let attempt = 0; ; attempt++) {
						reply = await this.post(
							{
								action: "login",
								...setSpanAttributes(span, { lgname, lgpassword, lgtoken }, [
									"params",
								]),
							},
							postWithResponse,
						);
						if (
							attempt ||
							reply.generation !== session.generation ||
							!reply.response.ok ||
							reply.apiError ||
							reply.data?.login?.result !== "NeedToken"
						)
							break;
						lgtoken = reply.data.login.token ?? (await this.getToken("login", true));
					}

					const r = setSpanAttributes(span, reply.data);
					if (reply.response.ok && !reply.apiError && r?.login?.result === "Success") {
						const current = reply.generation === session.generation;
						span.setAttribute("mediawiki.session.applied", current);
						if (current) {
							session.generation++;
							this.#tokens = null;
						}
						span.setAttribute("mediawiki.session.generation", session.generation);
						span.setStatus({ code: SpanStatusCode.OK });
						return r;
					}
					throw new Error(
						JSON.stringify(r?.login?.reason ?? r?.login?.result ?? r?.login ?? r?.error ?? r),
					);
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { ApiLoginParams["lgname"] } [lgname]
	 * @param { ApiLoginParams["lgpassword"] } [lgpassword]
	 * @returns { Promise<ApiResponse> }
	 */
	async login(lgname = this.#botUsername, lgpassword = this.#botPassword) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.login",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { lgname, lgpassword }, ["params"]);
					const r = await this.#login(lgname, lgpassword);
					setSpanAttributes(span, r);
					span.setStatus({ code: SpanStatusCode.OK });
					return r;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { ApiLogoutParams["token"] } [token]
	 * @returns { Promise<ApiResponse | string> }
	 */
	async logout(token) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.logout",
			this.#span,
			async span => {
				try {
					token = token ?? (await this.getToken("csrf"));
					const { response, data: r, apiError, generation } =
						await this.post({ action: "logout", token }, postWithResponse);
					setSpanAttributes(span, r);
					const empty = r === "" ||
						(r !== null && typeof r === "object" && !Object.keys(r).length);
					if (!response.ok || apiError || !empty)
						throw new Error(JSON.stringify(r?.error ?? r));

					const session = this.#session;
					const current = generation === session.generation;
					span.setAttribute("mediawiki.session.applied", current);
					if (current) {
						pruneCookies(session);
						session.generation++;
						session.expires.clear();
						this.#tokens = null;
						for (const name of Object.keys(session.cookie)) delete session.cookie[name];
						Object.assign(session.cookie, session.defaults);
					}
					span.setAttribute("mediawiki.session.generation", session.generation);
					span.setStatus({ code: SpanStatusCode.OK });
					return r;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	get cookie() {
		return tracer.startActiveSpan("mediaWiki.Api.cookie", this.#span, span => {
			try {
				pruneCookies(this.#session);
				const { cookie } = this.#session;
				setSpanAttributes(span, { cookie }, ["this"]);
				span.setStatus({ code: SpanStatusCode.OK });
				return cookie;
			} catch (e) {
				recordSpanError(span, e);
				throw e;
			} finally {
				span.end();
			}
		});
	}
}

/** @class Rest */
class Rest {
	/** @type { URL["href"] } */
	#rest;
	/** @type { Record<"head" | "get" | "post" | "put" | "delete", WikiRequestInit> } */
	#init;
	/** @type { Session } */
	#session;
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
				this.#session = getSession(cookie);
				const headers = {
					referer: url.href,
					"user-agent": userAgent,
					"Api-User-Agent": userAgent,
					cookie,
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
						"#defaultCookie": this.#session.defaults,
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
	 * @param { WikiRequestInit } init
	 * @returns { RequestInit }
	 */
	#cookies2string(init) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.#cookies2string",
			this.#span,
			span => {
				try {
					pruneCookies(this.#session);
					const cookie = Object.entries(this.#session.cookie)
						.map(([name, value]) => `${name}=${value}`)
						.join("; ");
					setSpanAttributes(span, init, ["init"]);
					const result = { ...init, headers: { ...init.headers, cookie } };
					span.setStatus({ code: SpanStatusCode.OK });
					return result;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { Response } response
	 * @param { number } generation
	 * @returns { Promise<RestResponse | string> }
	 */
	#parseRes(response, generation) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.#parseRes",
			this.#span,
			async span => {
				try {
					setResponseStatus(span, response);
					const cookieNames = readCookies(response.headers, this.#session, generation);
					setResponseHeaders(span, response.headers, cookieNames);
					const contentType = response.headers
						.get("content-type")
						?.split(";")[0].trim().toLowerCase();
					const json = contentType === "application/json" &&
						![204, 205, 304].includes(response.status);
					span.setAttribute("mediawiki.response.body_type", json ? "json" : "text");
					return json ? await response.json() : await response.text();
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { string } path
	 * @param { RestQuery } query
	 * @param { RequestInit } [headers]
	 * @returns { Promise<Response> }
	 */
	async head(path, query, headers = {}) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.head",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, query }, ["params"]);
					const search = new URLSearchParams(
						/** @type { ConstructorParameters<typeof URLSearchParams>[0] } */ (query),
					);
					const url = `${this.#rest}${path}?${search}`;
					const defaults = this.#cookies2string(this.#init.head);
					const overrides = { ...headers };
					setSpanAttributes(span, overrides, ["params", "headers"]);
					const init = {
						...defaults,
						...overrides,
					};
					span.setAttribute("http.request.method", init.method ?? "GET");
					const generation = this.#session.generation;
					const response = await fetch(url, init);
					setResponseStatus(span, response);
					const cookieNames = readCookies(response.headers, this.#session, generation);
					setResponseHeaders(span, response.headers, cookieNames);
					return response;
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { string } path
	 * @param { RestQuery } query
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async get(path, query, headers = {}) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.get",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, query }, ["params"]);
					const search = new URLSearchParams(
						/** @type { ConstructorParameters<typeof URLSearchParams>[0] } */ (query),
					);
					const url = `${this.#rest}${path}?${search}`;
					const defaults = this.#cookies2string(this.#init.get);
					const overrides = { ...headers };
					setSpanAttributes(span, overrides, ["params", "headers"]);
					const init = {
						...defaults,
						...overrides,
					};
					span.setAttribute("http.request.method", init.method ?? "GET");
					const generation = this.#session.generation;
					const response = await fetch(url, init);
					setResponseStatus(span, response);
					return await this.#parseRes(response, generation);
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async post(path, body, headers = {}) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.post",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, body }, ["params"]);
					const url = `${this.#rest}${path}`;
					const defaults = this.#cookies2string(this.#init.post);
					const overrides = { ...headers };
					setSpanAttributes(span, overrides, ["params", "headers"]);
					const init = {
						...defaults,
						...overrides,
						body: JSON.stringify(body),
					};
					span.setAttribute("http.request.method", init.method ?? "GET");
					const generation = this.#session.generation;
					const response = await fetch(url, init);
					setResponseStatus(span, response);
					return await this.#parseRes(response, generation);
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async put(path, body, headers = {}) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.put",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, body }, ["params"]);
					const url = `${this.#rest}${path}`;
					const defaults = this.#cookies2string(this.#init.put);
					const overrides = { ...headers };
					setSpanAttributes(span, overrides, ["params", "headers"]);
					const init = {
						...defaults,
						...overrides,
						body: JSON.stringify(body),
					};
					span.setAttribute("http.request.method", init.method ?? "GET");
					const generation = this.#session.generation;
					const response = await fetch(url, init);
					setResponseStatus(span, response);
					return await this.#parseRes(response, generation);
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { RequestInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async delete(path, body, headers = {}) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.delete",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, body }, ["params"]);
					const url = `${this.#rest}${path}`;
					const defaults = this.#cookies2string(this.#init.delete);
					const overrides = { ...headers };
					setSpanAttributes(span, overrides, ["params", "headers"]);
					const init = {
						...defaults,
						...overrides,
						body: JSON.stringify(body),
					};
					span.setAttribute("http.request.method", init.method ?? "GET");
					const generation = this.#session.generation;
					const response = await fetch(url, init);
					setResponseStatus(span, response);
					return await this.#parseRes(response, generation);
				} catch (e) {
					recordSpanError(span, e);
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}

	get cookie() {
		return tracer.startActiveSpan("mediaWiki.Rest.cookie", this.#span, span => {
			try {
				pruneCookies(this.#session);
				const { cookie } = this.#session;
				setSpanAttributes(span, { cookie }, ["this"]);
				span.setStatus({ code: SpanStatusCode.OK });
				return cookie;
			} catch (e) {
				recordSpanError(span, e);
				throw e;
			} finally {
				span.end();
			}
		});
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
