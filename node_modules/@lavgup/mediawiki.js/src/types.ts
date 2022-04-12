export interface Config {
    url: string,
    botUsername?: string,
    botPassword?: string
}

export interface Payload {
    responseType: 'json' | 'text' | 'buffer' | undefined;
    [key: string]: any;
}

export interface ResObject {
    [key: string]: any;
}

export type ErrorsList = 'FAILED_LOGIN'
    | 'LOADING_CONFIG'
    | 'MEDIAWIKI_ERROR'
    | 'NO_CONFIG'
    | 'NO_CREDENTIALS';

export interface Errors {
    FAILED_LOGIN: (error: string) => string,
    LOADING_CONFIG: (error: string) => string,
    MEDIAWIKI_ERROR: (error: string) => string,
    NO_CONFIG: string,
    NO_CREDENTIALS: string
}