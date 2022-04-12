import { Config, Payload, ResObject } from './types';
import got from 'got';
import { CookieJar } from 'tough-cookie';
import { MediaWikiJSError } from './MediaWikiJSError';
import { MediaWikiJS } from './MediaWikiJS';

export class API {
    private mwToken: string;
    private options: Config;
    loginRetries = 0;
    bot: MediaWikiJS;
    jar: CookieJar;
    url: string;

    constructor(bot: MediaWikiJS, options: Config) {
        this.options = options;
        this.url = options.url;
        this.bot = bot;

        this.jar = new CookieJar();
        this.mwToken = '+\\';
    }

    private async mw(params: Record<string, unknown>, csrf: boolean | undefined, method: 'GET' | 'POST'): Promise<ResObject> {
        const payload: Payload = {
            responseType: 'json',
            cookieJar: this.jar
        };

        const payloadType = (method === 'POST' ? 'form' : 'searchParams');
        payload[payloadType] = {
            ...params,
            format: 'json',
            formatversion: 2
        };

        // Add csrf
        if (csrf) payload[payloadType].token = this.mwToken;

        const { body }: ResObject = await (method === 'POST' ? got.post : got.get)(this.url, payload);

        if (!body) {
            throw new MediaWikiJSError('MEDIAWIKI_ERROR', 'Request did not return a body');
        }

        // Handle session loss
        if (body.login?.result === 'Aborted') {
            if (body.login.reason === 'Cannot log in when using MediaWiki\\Session\\BotPasswordSessionProvider sessions.') return {
                login: {
                    result: 'Success',
                    preventOverwrite: true
                }
            };

            if (this.loginRetries >= 1) {
                throw new MediaWikiJSError('FAILED_LOGIN', body.login.reason);
            }

            this.loginRetries++;
            await this.bot.login(this.options.botUsername, this.options.botPassword);
            return this.mw(params, csrf, method);
        }

        if (body.error) {
            // CSRF Catch
            if (body.error?.code === 'badtoken') {
                let tokenPack: ResObject = await this.get({
                    action: 'query',
                    meta: 'tokens',
                    type: 'csrf'
                });

                if (tokenPack?.query?.tokens?.csrftoken) {
                    this.mwToken = tokenPack.query.tokens.csrftoken;
                } else {
                    // MW 1.19 support
                    tokenPack = await this.get({
                        action: 'query',
                        prop: 'info',
                        intoken: 'edit',
                        titles: 'F'
                    });

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.mwToken = Object.values(tokenPack.query.pages)[0].edittoken;
                }

                return this.mw(params, csrf, method);
            }

            throw new MediaWikiJSError('MEDIAWIKI_ERROR', body.error.info);
        }

        return body;
    }

    get(params: Record<string, unknown>, csrf?: boolean): Promise<ResObject> {
        return this.mw(params, csrf, 'GET');
    }

    post(params: Record<string, unknown>, csrf?: boolean): Promise<ResObject> {
        return this.mw(params, csrf, 'POST');
    }
}