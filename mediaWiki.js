"use strict";
/**
 * @module mediaWiki
 * @import { ReadStream } "fs"
 * @import { ApiResponse } "types-mediawiki/mw/Api"
 * @import { RestResponse } "types-mediawiki/mw/Rest"
 * @import { ApiLoginParams, ApiLogoutParams, ApiTokenType, UnknownApiParams, ApiParams, ApiFormatJsonParams } "types-mediawiki-api"
 * @import "types-mediawiki/mw/Rest"
 * @import { Tracer, Span, SpanContext } "@opentelemetry/api"
 */

const { trace, SpanStatusCode } = require("@opentelemetry/api");
const {
	ATTR_HTTP_RESPONSE_HEADER,
} = require("@opentelemetry/semantic-conventions");

/** @type { Tracer } */
const tracer = trace.getTracer(__filename.slice(__dirname.length + 1));

/** @type {string: string} */
const cookies = {};

/** @type {string: any} */
const pack = require("./package.json");

/**
 * @param { Span } span
 * @param { { string: any } | any } r
 * @param { string[] } [path=["result"]]
 * @returns { { string: any } | any }
 */
const setSpanAttributes = (span, r, path = ["api-response"]) => {
	if (typeof r === "object" && r !== null)
		for (const [k, v] of Object.entries(r)) {
			if (typeof v !== "object") {
				span.setAttribute(
					`${path.join(".")}.${k}`,
					k.toLowerCase().endsWith("password") ||
						k.toLowerCase().endsWith("token") ||
						k.toLowerCase().endsWith("cookie")
						? typeof v
						: v,
				);
			} else if (k.toLowerCase().endsWith("cookie"))
				span.setAttribute(
					`${path.join(".")}.${k}`,
					JSON.stringify(Object.keys(v)),
				);
			else if (Array.isArray(v))
				span.setAttribute(`${path.join(".")}.${k}`, JSON.stringify(v));
			else setSpanAttributes(span, v, [...path, k]);
		}
	return r;
};

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
	/** @type { { links: [{ context:SpanContext }] } } */
	#span;
	/**
	 * @param { { api: URL["href"]; botUsername: string; botPassword: string; cookie:{ string: string } } } config
	 */
	constructor({ api, botUsername, botPassword, cookie = {} }) {
		tracer.startActiveSpan("mediaWiki.Api.constructor", span => {
			try {
				setSpanAttributes(
					span,
					{
						api,
						botUsername,
						botPassword,
						cookie: JSON.stringify(Object.keys(cookie)),
					},
					["params"],
				);
				api = new URL(api);
				api.hash = "";
				api.search = "";
				this.#api = api.href;
				const headers = {
					referer: api.href,
					"user-agent": `${pack.name || ""}/${pack.version || ""} (+${
						pack.homepage ||
						pack.repository?.url ||
						pack?.bugs?.url ||
						""
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
				setSpanAttributes(
					span,
					{
						"#api": this.#api,
						"#botUsername": this.#botUsername,
						"#botPassword": this.#botPassword,
						"#init": this.#init,
						"#defaultCookie": this.#defaultCookie,
					},
					["this"],
				);
				this.#span = { links: [{ context: span.spanContext() }] };
				span.setStatus({ code: SpanStatusCode.OK });
			} catch (e) {
				span.recordException(e);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: e.message,
				});
				throw e;
			} finally {
				span.end();
			}
		});
	}
	/**
	 * @private
	 * @param { Response } res
	 * @returns { Promise<ApiResponse | string> }
	 */
	#parseRes(res) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.#parseRes",
			this.#span,
			span => {
				try {
					for (const [k, v] of res.headers) {
						if (k === "set-cookie") continue;
						span.setAttribute(ATTR_HTTP_RESPONSE_HEADER(k), v);
					}
					span.setAttribute(
						ATTR_HTTP_RESPONSE_HEADER("set-cookie"),
						JSON.stringify(
							res.headers.getSetCookie().map(c => {
								const k = c.split("=")[0];
								cookies[k] = c.split(/[=;]/)[1];
								return k;
							}),
						),
					);
					return res.headers.get("content-type").split(";")[0] ===
						"application/json"
						? span.setStatus({ code: SpanStatusCode.OK }) &&
								res.json()
						: res.text();
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @private
	 * @param { RequestInit & { cookie: { string: string } } } init
	 * @returns { RequestInit }
	 */
	#cookies2string(init) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.#cookies2string",
			this.#span,
			span => {
				try {
					return (
						span.setStatus({ code: SpanStatusCode.OK }) &&
						setSpanAttributes(
							span,
							Object.assign(
								Object.assign(
									{},
									setSpanAttributes(span, init, ["init"]),
								),
								{
									headers: Object.assign(
										Object.assign({}, init.headers),
										{
											cookie: Object.entries(
												init.headers.cookie,
											)
												.map(([k, v]) => `${k}=${v}`)
												.join("; "),
										},
									),
								},
							),
							["init"],
						)
					);
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @private
	 * @param { UnknownApiParams } parameters
	 * @returns { ApiParams }
	 */
	#listToPipe(parameters) {
		return tracer.startActiveSpan(
			"mediaWiki.Api.#listToPipe",
			this.#span,
			span => {
				try {
					return (
						span.setStatus({ code: SpanStatusCode.OK }) &&
						setSpanAttributes(
							span,
							Object.fromEntries(
								Object.entries(
									setSpanAttributes(span, parameters, [
										"api-params",
									]),
								)
									.filter(
										([k, v]) =>
											Object.keys(
												this.#parameters,
											).includes(k) ||
											![false, null, undefined].includes(
												v,
											),
									)
									.map(([k, v]) =>
										Array.isArray(v)
											? [k, v.join("|")]
											: [k, v],
									),
							),
							["api-params"],
						)
					);
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @async
	 * @param { ApiParams } parameters
	 * @returns { Promise<ApiResponse | string> }
	 */
	async get(parameters) {
		return await tracer.startActiveSpan(
			"mediaWiki.Api.get",
			this.#span,
			async span => {
				try {
					return await fetch(
						`${this.#api}?${new URLSearchParams({
							...this.#parameters,
							...this.#listToPipe(
								setSpanAttributes(span, parameters, [
									"api-params",
								]),
							),
						})}`,
						this.#cookies2string(this.#init.get),
					)
						.then(
							span.setStatus({ code: SpanStatusCode.OK }) &&
								this.#parseRes.bind(this),
						)
						.catch(e => {
							span.recordException(e);
							span.setStatus({
								code: SpanStatusCode.ERROR,
								message: e.message,
							});
							throw e;
						})
						.finally(() => span.end());
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					span.end();
					throw e;
				}
			},
		);
	}
	/**
	 * @async
	 * @param { ApiTokenType } [type=csrf]
	 * @param { boolean } [newToken=false]
	 * @returns { string | Promise<string> }
	 * @throws { TypeError }
	 */
	async getToken(type = "csrf", newToken = false) {
		return await tracer.startActiveSpan(
			"mediaWiki.Api.getToken",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { type, newToken }, ["params"]);
					if (typeof type !== "string") throw new TypeError("types");
					const key = `${type}token`;
					if (this.#tokens instanceof Promise)
						return (
							span.setStatus({ code: SpanStatusCode.OK }) &&
							(await this.#tokens)[key]
						);
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
						}).then(
							res => setSpanAttributes(span, res).query.tokens,
						);
						this.#tokens = await this.#tokens;
					}
					return (
						span.setStatus({ code: SpanStatusCode.OK }) &&
						this.#tokens[key]
					);
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @async
	 * @param { ApiParams & { file?: ReadStream } } parameters
	 * @returns { Promise<ApiResponse | string> }
	 * @throws { TypeError }
	 */
	async post(parameters) {
		return await tracer.startActiveSpan(
			"mediaWiki.Api.post",
			this.#span,
			async span => {
				try {
					if (parameters.action === "upload" && parameters.file) {
						await tracer.startActiveSpan(
							"mediaWiki.Api.post.upload",
							this.#span,
							async span => {
								try {
									const { file, filesize } = parameters;
									if (file.constructor.name !== "ReadStream")
										throw new TypeError("file");
									const async =
										filesize > file.readableHighWaterMark;
									delete parameters.file;
									parameters.offset = 0;
									setSpanAttributes(span, parameters, [
										"api-params",
									]);
									await new Promise((res, rej) => {
										file.on("data", async chunk => {
											await tracer.startActiveSpan(
												"mediaWiki.Api.post.upload.chunk",
												this.#span,
												async span => {
													try {
														file.pause();
														const body =
															new FormData();
														Object.entries({
															...this.#parameters,
															...this.#listToPipe(
																parameters,
															),
															stash: async,
															async,
														}).forEach(([k, v]) => {
															body.append(k, v);
															setSpanAttributes(
																span,
																{ [k]: v },
																["api-params"],
															);
														});
														body.append(
															"chunk",
															new Blob([chunk]),
														);
														const upload =
															async () => {
																const r =
																	await fetch(
																		this
																			.#api,
																		{
																			...this.#cookies2string(
																				this
																					.#init
																					.post,
																			),
																			body,
																		},
																	).then(
																		this.#parseRes.bind(
																			this,
																		),
																	);
																if (
																	async &&
																	r?.error
																		?.code ===
																		"badtoken"
																) {
																	console.warn(
																		"badtoken",
																	);
																	await this.getToken(
																		"csrf",
																		true,
																	);
																	return await upload();
																}
																parameters.filekey =
																	r?.upload?.filekey;
																if (
																	r?.upload
																		?.result ===
																	"Success"
																) {
																	span.setStatus(
																		{
																			code: SpanStatusCode.OK,
																		},
																	);
																	return res(
																		delete parameters.offset,
																	);
																}
																if (
																	r?.upload
																		?.result !==
																	"Continue"
																)
																	return rej(
																		new Error(
																			JSON.stringify(
																				r?.error ??
																					r,
																			),
																		),
																	);
																parameters.offset =
																	r.upload.offset;
																span.setStatus({
																	code: SpanStatusCode.OK,
																});
															};
														await upload();
														file.resume();
													} catch (e) {
														span.recordException(e);
														span.setStatus({
															code: SpanStatusCode.ERROR,
															message: e.message,
														});
														throw e;
													} finally {
														span.end();
													}
												},
											);
										});
										file.on("error", rej);
										file.on("end", () =>
											span.setStatus({
												code: SpanStatusCode.OK,
											}),
										);
									}).finally(
										() => file.destroyed || file.destroy(),
									);
								} catch (e) {
									span.recordException(e);
									span.setStatus({
										code: SpanStatusCode.ERROR,
										message: e.message,
									});
									throw e;
								} finally {
									span.end();
								}
							},
						);
					}
					return await fetch(this.#api, {
						...this.#cookies2string(this.#init.post),
						body: new URLSearchParams({
							...this.#parameters,
							...this.#listToPipe(
								setSpanAttributes(span, parameters, [
									"api-params",
								]),
							),
						}),
					})
						.then(
							span.setStatus({ code: SpanStatusCode.OK }) &&
								this.#parseRes.bind(this),
						)
						.catch(e => {
							span.recordException(e);
							span.setStatus({
								code: SpanStatusCode.ERROR,
								message: e.message,
							});
							throw e;
						})
						.finally(() => span.end());
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					span.end();
					throw e;
				}
			},
		);
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
		return await tracer.startActiveSpan(
			"mediaWiki.Api.#login",
			this.#span,
			async span => {
				try {
					lgtoken = lgtoken ?? (await this.getToken("login"));
					const r = await this.post({
						action: "login",
						...setSpanAttributes(
							span,
							{ lgname, lgpassword, lgtoken },
							["api-params"],
						),
					});
					setSpanAttributes(span, r);
					if (r?.login?.result === "NeedToken")
						return await this.login(
							lgname,
							lgpassword,
							r?.login?.token,
						);
					if (r?.login?.result === "Success") {
						span.setStatus({ code: SpanStatusCode.OK });
						return r;
					}
					throw new Error(
						JSON.stringify(
							r?.login?.reason ??
								r?.login?.result ??
								r?.login ??
								r?.error ??
								r,
						),
					);
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @async
	 * @param { ApiLoginParams["lgname"] } [lgname]
	 * @param { ApiLoginParams["lgpassword"] } [lgpassword]
	 * @returns { Promise<ApiResponse> }
	 */
	async login(lgname = this.#botUsername, lgpassword = this.#botPassword) {
		return await tracer.startActiveSpan(
			"mediaWiki.Api.login",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { lgname, lgpassword }, [
						"api-params",
					]);
					const r = await this.#login(lgname, lgpassword);
					setSpanAttributes(span, r);
					span.setStatus({ code: SpanStatusCode.OK });
					return r;
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @async
	 * @returns { Promise<ApiResponse> }
	 * @param { ApiLogoutParams["token"] } [token]
	 * @throws { TypeError }
	 */
	async logout(token) {
		return await tracer.startActiveSpan(
			"mediaWiki.Api.logout",
			this.#span,
			async span => {
				try {
					token = token ?? (await this.getToken("csrf"));
					const r = await this.post({ action: "logout", token });
					this.#tokens = null;
					Object.keys(cookies).forEach(k => delete cookies[k]);
					Object.assign(cookies, this.#defaultCookie);
					if (typeof r !== "object") new TypeError(r);
					setSpanAttributes(span, r);
					if (!Object.keys(r).length)
						span.setStatus({ code: SpanStatusCode.OK });
					else if (r.error) {
						throw new Error(JSON.stringify(r?.error ?? r));
					}
					return r;
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
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
	/** @type { { links: [{ context:SpanContext }] } } */
	#span;
	/**
	 * @param { { rest: URL["href"]; cookie:{ string: string } } } config
	 */
	constructor({ rest, cookie = {} }) {
		tracer.startActiveSpan("mediaWiki.Rest.constructor", span => {
			try {
				setSpanAttributes(
					span,
					{
						rest,
						cookie: JSON.stringify(Object.keys(cookie)),
					},
					["params"],
				);
				rest = new URL(rest);
				rest.hash = "";
				rest.search = "";
				this.#rest = rest.href;
				const headers = {
					referer: rest.href,
					"user-agent": `${pack.name || ""}/${pack.version || ""} (+${
						pack.homepage ||
						pack.repository?.url ||
						pack?.bugs?.url ||
						""
					}; ${pack.bugs?.email || ""}) `,
					cookie: cookies,
				};
				this.#init = {
					head: { headers, method: "HEAD" },
					get: { headers },
					post: {
						headers: {
							...headers,
							"Content-Type": "application/json",
						},
						method: "POST",
					},
					put: {
						headers: {
							...headers,
							"Content-Type": "application/json",
						},
						method: "PUT",
					},
					delete: {
						headers: {
							...headers,
							"Content-Type": "application/json",
						},
						method: "DELETE",
					},
				};
				this.#defaultCookie = cookie;
				Object.assign(cookies, this.#defaultCookie);
				setSpanAttributes(
					span,
					{
						"#rest": this.#rest,
						"#init": this.#init,
						"#defaultCookie": this.#defaultCookie,
					},
					["this"],
				);
				this.#span = { links: [{ context: span.spanContext() }] };
				span.setStatus({ code: SpanStatusCode.OK });
			} catch (e) {
				span.recordException(e);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: e.message,
				});
				throw e;
			} finally {
				span.end();
			}
		});
	}
	/**
	 * @private
	 * @param { Response } res
	 * @returns { Promise<RestResponse | string> }
	 */
	#parseRes(res) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.#parseRes",
			this.#span,
			span => {
				try {
					for (const [k, v] of res.headers) {
						if (k === "set-cookie") continue;
						span.setAttribute(ATTR_HTTP_RESPONSE_HEADER(k), v);
					}
					span.setAttribute(
						ATTR_HTTP_RESPONSE_HEADER("set-cookie"),
						JSON.stringify(
							res.headers.getSetCookie().map(c => {
								const k = c.split("=")[0];
								cookies[k] = c.split(/[=;]/)[1];
								return k;
							}),
						),
					);
					return res.headers.get("content-type").split(";")[0] ===
						"application/json"
						? span.setStatus({ code: SpanStatusCode.OK }) &&
								res.json()
						: res.text();
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @private
	 * @param { RequestInit & { cookie: { string: string } } } init
	 * @returns { RequestInit }
	 */
	#cookies2string(init) {
		return tracer.startActiveSpan(
			"mediaWiki.Rest.#cookies2string",
			this.#span,
			span => {
				try {
					return (
						span.setStatus({ code: SpanStatusCode.OK }) &&
						setSpanAttributes(
							span,
							Object.assign(
								Object.assign(
									{},
									setSpanAttributes(span, init, ["init"]),
								),
								{
									headers: Object.assign(
										Object.assign({}, init.headers),
										{
											cookie: Object.entries(
												init.headers.cookie,
											)
												.map(([k, v]) => `${k}=${v}`)
												.join("; "),
										},
									),
								},
							),
							["init"],
						)
					);
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @param { string } path
	 * @param { URLSearchParams | string | Record<string, string | readonly string[]> | Iterable<[string, string]> | ReadonlyArray<[string, string]> } query
	 * @param { HeadersInit } [headers={}]
	 * @returns { Promise<Response> }
	 */
	async head(path, query, headers = {}) {
		return await tracer.startActiveSpan(
			"mediaWiki.Rest.head",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, query, headers }, [
						"rest-params",
					]);
					return await fetch(
						`${this.#rest}${path}?${new URLSearchParams(query)}`,
						{ ...this.#init.head, ...headers },
					).then(res => {
						span.setAttribute(
							ATTR_HTTP_RESPONSE_HEADER("set-cookie"),
							JSON.stringify(
								res.headers.getSetCookie().map(c => {
									const k = c.split("=")[0];
									cookies[k] = c.split(/[=;]/)[1];
									return k;
								}),
							),
						);
						const contentType = res.headers.get("content-type");
						span.setAttribute(
							ATTR_HTTP_RESPONSE_HEADER("content-type"),
							contentType,
						);
						return (
							span.setStatus({ code: SpanStatusCode.OK }) && res
						);
					});
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					throw e;
				} finally {
					span.end();
				}
			},
		);
	}
	/**
	 * @param { string } path
	 * @param { URLSearchParams | string | Record<string, string | readonly string[]> | Iterable<[string, string]> | ReadonlyArray<[string, string]> } query
	 * @param { HeadersInit } [headers={}]
	 * @returns { Promise<RestResponse | string> }
	 */
	async get(path, query, headers = {}) {
		return await tracer.startActiveSpan(
			"mediaWiki.Rest.get",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, query, headers }, [
						"rest-params",
					]);
					return await fetch(
						`${this.#rest}${path}?${new URLSearchParams(query)}`,
						{ ...this.#cookies2string(this.#init.get), ...headers },
					)
						.then(
							span.setStatus({ code: SpanStatusCode.OK }) &&
								this.#parseRes.bind(this),
						)
						.catch(e => {
							span.recordException(e);
							span.setStatus({
								code: SpanStatusCode.ERROR,
								message: e.message,
							});
							throw e;
						})
						.finally(() => span.end());
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					span.end();
					throw e;
				}
			},
		);
	}
	/**
	 * @param { string } path
	 * @param { { string: any } } body
	 * @param { HeadersInit } [headers={}]
	 * @returns { Promise<RestResponse | string> }
	 */
	async post(path, body, headers = {}) {
		return await tracer.startActiveSpan(
			"mediaWiki.Rest.post",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, body, headers }, [
						"rest-params",
					]);
					return await fetch(`${this.#rest}${path}`, {
						...this.#cookies2string(this.#init.post),
						...headers,
						body: JSON.stringify(body),
					})
						.then(
							span.setStatus({ code: SpanStatusCode.OK }) &&
								this.#parseRes.bind(this),
						)
						.catch(e => {
							span.recordException(e);
							span.setStatus({
								code: SpanStatusCode.ERROR,
								message: e.message,
							});
							throw e;
						})
						.finally(() => span.end());
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					span.end();
					throw e;
				}
			},
		);
	}
	/**
	 * @param { string } path
	 * @param { { string: any } } body
	 * @param { HeadersInit } [headers]
	 * @returns { Promise<RestResponse | string> }
	 */
	async put(path, body, headers = {}) {
		return await tracer.startActiveSpan(
			"mediaWiki.Rest.put",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, body, headers }, [
						"rest-params",
					]);
					return await fetch(`${this.#rest}${path}`, {
						...this.#cookies2string(this.#init.put),
						...headers,
						body: JSON.stringify(body),
					})
						.then(
							span.setStatus({ code: SpanStatusCode.OK }) &&
								this.#parseRes.bind(this),
						)
						.catch(e => {
							span.recordException(e);
							span.setStatus({
								code: SpanStatusCode.ERROR,
								message: e.message,
							});
							throw e;
						})
						.finally(() => span.end());
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					span.end();
					throw e;
				}
			},
		);
	}
	/**
	 * @param { string } path
	 * @param { Record<string, any> } body
	 * @param { HeadersInit } [headers={}]
	 * @returns { Promise<RestResponse | string> }
	 */
	async delete(path, body, headers = {}) {
		return await tracer.startActiveSpan(
			"mediaWiki.Rest.delete",
			this.#span,
			async span => {
				try {
					setSpanAttributes(span, { path, body, headers }, [
						"rest-params",
					]);
					return await fetch(`${this.#rest}${path}`, {
						...this.#cookies2string(this.#init.delete),
						...headers,
						body: JSON.stringify(body),
					})
						.then(
							span.setStatus({ code: SpanStatusCode.OK }) &&
								this.#parseRes.bind(this),
						)
						.catch(e => {
							span.recordException(e);
							span.setStatus({
								code: SpanStatusCode.ERROR,
								message: e.message,
							});
							throw e;
						})
						.finally(() => span.end());
				} catch (e) {
					span.recordException(e);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: e.message,
					});
					span.end();
					throw e;
				}
			},
		);
	}
}

/** @type { { Api: typeof Api; Rest: typeof Rest } } */
const mediaWiki = { Api, Rest };
module.exports = { mediaWiki, mw: mediaWiki, tracer, SpanStatusCode };
