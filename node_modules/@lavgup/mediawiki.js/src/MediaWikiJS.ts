import { API } from './API';
import { MediaWikiJSError } from './MediaWikiJSError';

import { Config, ResObject } from './types';

/**
 * A MediaWikiJS object.
 * @param options - The configuration options.
 * @param options.url - The url to the wiki's api.php file.
 * @param [options.botUsername] - The bot's bot username, obtained from Special:BotPasswords.
 * @param [options.botPassword] - The bot's bot password, obtained from Special:BotPasswords.
 */
export class MediaWikiJS {
    api: API;
    API_LIMIT: number;
    options: Config;

    constructor(options: Config) {
        if (!options) {
            throw new MediaWikiJSError('NO_CONFIG');
        }

        this.api = new API(this, options);
        this.options = options;

        this.API_LIMIT = 5000;
    }

    /**
     * Logs in to a wiki bot.
     * @param [username] - username The bot username of the account to log in to.
     * @param [password] - The bot password of the account to log in to.
     */
    async login(username?: string, password?: string): Promise<Record<string, unknown>> {
        if (username && !this.options.botUsername) this.options.botUsername = username;
        if (password && !this.options.botPassword) this.options.botPassword = password;

        if (!username && this.options.botUsername) username = this.options.botUsername;
        if (!password && this.options.botPassword) password = this.options.botPassword;

        if (!username || !password) throw new MediaWikiJSError('NO_CREDENTIALS');

        const queryToken = await this.api.get({
            action: 'query',
            meta: 'tokens',
            type: 'login'
        });

        const loginObj = (lgtoken: string) => {
            const out: { action: string, lgname: string | undefined, lgpassword: string | undefined, lgtoken?: string } = {
                action: 'login',
                lgname: username,
                lgpassword: password
            };

            if (lgtoken) out.lgtoken = lgtoken;
            return out;
        };

        // Initial attempt
        let actionLogin = await this.api.post(loginObj(queryToken?.query?.tokens?.logintoken));

        // Support for MW 1.19
        if (actionLogin?.login?.result === 'NeedToken') actionLogin = await this.api.post(loginObj(actionLogin?.login?.token));

        // Successful login
        if (actionLogin?.login?.result === 'Success') return actionLogin;

        // Reason throwing
        if (actionLogin?.login?.result) throw new MediaWikiJSError('FAILED_LOGIN', actionLogin?.login?.result);

        // Unspecified throwing
        throw new MediaWikiJSError('FAILED_LOGIN', 'Unspecified error! Dumping: ', JSON.stringify(actionLogin));
    }

    /**
     * Logs out of a wiki bot.
     * Removes cookies and deletes tokens.
     */
    async logout(): Promise<ResObject> {
        const token = await this.getCSRFToken();
        const res = await this.api.post({
            action: 'logout',
            token
        });
        this.api.jar.removeAllCookiesSync();

        return res;
    }

    /**
     * Gets a CSRF token.
     */
    async getCSRFToken(): Promise<string> {
        let tokenPack: ResObject = await this.api.get({
            action: 'query',
            meta: 'tokens',
            type: 'csrf'
        });

        let token;

        if (tokenPack?.query?.tokens?.csrftoken) {
            token = tokenPack.query.tokens.csrftoken;
        } else {
            // MW 1.19 support
            tokenPack = await this.api.get({
                action: 'query',
                prop: 'info',
                intoken: 'edit',
                titles: 'F'
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            token = Object.values(tokenPack.query.pages)[0].edittoken;
        }

        return token;
    }

    /**
     * Gets the first item in an object.
     * @param object - The object to get the first item of.
     */
    getFirstItem(object: {[key: string]: never}): {[key: string]: never} {
        const key = Object.keys(object).shift();
        if (!key) return object;

        return object[key];
    }

    /**
     * Gets only the page titles of a list and formats it into an array.
     * @param array - The array to get a list from.
     * @param property - The property of the page title in each object.
     */
    getList(array: Record<string, unknown>[], property = 'title'): string[] {
        const list: string[] = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        array.forEach((elem: {[key: string]: never}) => list.push(elem[property]));

        return list;
    }

    /**
     * Gets pages in a category.
     * @param category - The category to get pages of.
     * @param onlyTitles - Whether to only list the page titles.
     */
    async getPagesInCategory(category: string, onlyTitles = false): Promise<string[] | Record<string, unknown>[]> {
        const body = await this.api.get({
            action: 'query',
            list: 'categorymembers',
            cmtitle: category,
            cmlimit: this.API_LIMIT
        });

        if (onlyTitles) return this.getList(body.query.categorymembers);
        return body.query.categorymembers;
    }

    /**
     * Gets all categories an article is in.
     * @param title - The title of the page to get categories from.
     * @param onlyTitles - Whether to only list the page titles.
     */
    async getArticleCategories(title: string, onlyTitles = false): Promise<string[] | Record<string, unknown>[]> {
        const body = await this.api.get({
            action: 'query',
            prop: 'categories',
            cllimit: this.API_LIMIT,
            titles: title
        });

        const page = this.getFirstItem(body.query.pages);

        if (onlyTitles) return this.getList(page.categories);
        return page.categories;
    }

    /**
     * Searches the wiki.
     * @param keyword - The keyword for the search.
     * @param onlyTitles - Whether to only list the page titles.
     */
    async search(keyword: string, onlyTitles = false): Promise<string[] | Record<string, unknown>[]> {
        const body = await this.api.get({
            action: 'query',
            list: 'search',
            srsearch: keyword,
            srprop: 'timestamp',
            srlimit: this.API_LIMIT
        });

        if (onlyTitles) return this.getList(body.query.search);
        return body.query.search;
    }

    /**
     * Main wrapper for editing pages.
     * @param params - Mandatory params for the edit.
     */
    doEdit(params: {[key:string]: unknown}): Promise<Record<string, unknown>> {
        return this.api.post({
            action: 'edit',
            bot: '',
            minor: params.minor || '',
            ...params,
        }, true);
    }

    /**
     * Edits the contents of a page.
     * @param options - The options for the edit.
     * @param options.title - The title of the page to edit.
     * @param options.content - The content of the edit.
     * @param options.summary - The summary of the edit.
     * @param options.minor - Whether to mark the edit as minor.
     */
    edit({ title, content, summary, minor = true }: {
        title: string,
        content: string,
        summary: string,
        minor?: boolean
    }): Promise<ResObject> {
        return this.doEdit({ title: title, text: content, summary: summary, minor: minor });
    }

    /**
     * Appends content to a page.
     * @param options - The options for the edit.
     * @param options.title - The title of the page to edit.
     * @param options.content - The content of the edit.
     * @param options.summary - The summary of the edit.
     * @param options.minor - Whether to mark the edit as minor.
     */
    prepend({ title, content, summary, minor = true }: {
        title: string,
        content: string,
        summary: string,
        minor?: boolean
    }): Promise<ResObject> {
        return this.doEdit({ title: title, prependtext: content, summary: summary, minor: minor });
    }

    /**
     * Appends content to a page.
     * @param options - The options for the edit.
     * @param options.title - The title of the page to edit.
     * @param options.content - The content of the edit.
     * @param options.summary - The summary of the edit.
     * @param options.minor - Whether to mark the edit as minor.
     */
    append({ title, content, summary, minor = true }: {
        title: string,
        content: string,
        summary: string,
        minor?: boolean
    }): Promise<ResObject> {
        return this.doEdit({ title: title, appendtext: content, summary: summary, minor: minor });
    }

    /**
     * Undoes a revision.
     * @param options - The options for the undo.
     * @param options.title - The title of the page of which revision to undo.
     * @param options.revision - The revision to undo.
     * @param options.summary - The summary of the edit.
     */
    undo({ title, revision, summary }: {
        title: string,
        revision: string,
        summary: string
    }): Promise<ResObject> {
        return this.doEdit({ title: title, undo: revision, summary: summary });
    }

    /**
     * Deletes a page.
     * @param options - The options for the deletion.
     * @param options.title - The title of the page to delete.
     * @param options.reason - The reason for deleting the page.
     */
    delete({ title, reason = '' }: { title: string, reason?: string }): Promise<ResObject> {
        return this.api.post({
            action: 'delete',
            title,
            reason,
        }, true);
    }

    /**
     * Restore revisions of a deleted page.
     * @param options - The options for the deletion.
     * @param options.title - The title of the page to restore.
     * @param options.reason - The reason for restoring this page.
     */
    restore({ title, reason = '' }: { title: string, reason?: string }): Promise<ResObject> {
        return this.api.post({
            action: 'undelete',
            title,
            reason,
        }, true);
    }

    /**
     * Change the protection level of a page.
     * @param options - The options for the protection.
     * @param options.title - The title of the page to modify the protection level of.
     * @param options.protections - The protections to set the page to.
     * @param options.expiry - The expiry for the protection.
     * @param options.reason - The reason for modifying the page's protection level.
     * @param options.cascade - Whether to enable cascading protection.
     */
    protect({ title, protections, expiry, reason, cascade = false }: {
        title: string,
        protections: {edit: string | undefined, move: string | undefined},
        expiry: string,
        reason: string,
        cascade?: boolean
    }): Promise<ResObject> {
        const formattedProtections = [];
        for (const [key, val] of Object.entries(protections)) {
            formattedProtections.push(`${key}=${val}`);
        }

        return this.api.post({
            action: 'protect',
            title,
            protections: formattedProtections.join('|'),
            expiry,
            reason,
            cascade,
        }, true);
    }

    /**
     * Blocks a user.
     * @param options - The options for the block.
     * @param options.user - The username of the user to block.
     * @param options.expiry - The expiry of the block.
     * @param options.reason - The reason for the block.
     * @param [options.allowUserTalk] - Whether to block the user from editing their own talk page.
     * @param [options.autoblock] - Whether to automatically block the last used IP address, and any subsequent IP addresses they try to login from.
     * @param [options.reblock] - Whether to overwrite the existing block, if the user is already blocked.
     */
    block({ user, expiry, reason, allowUserTalk = false, autoblock = true, reblock = false }: {
        user: string,
        expiry: string,
        reason: string,
        allowUserTalk?: boolean,
        autoblock?: boolean
        reblock?: boolean
    }): Promise<ResObject> {
        return this.api.post({
            action: 'block',
            user,
            expiry,
            reason,
            allowusertalk: allowUserTalk,
            autoblock,
            reblock,
        }, true);
    }

    /**
     * Unblocks a user.
     * @param user - The username of the user to unblock.
     * @param reason - The reason for the unblock.
     */
    unblock(user: string, reason: string): Promise<ResObject> {
        return this.api.post({
            action: 'unblock',
            user,
            reason,
        }, true);
    }

    /**
     * Purges the cache of a list of pages.
     * @param titles - The title(s) of the pages to delete.
     */
    purge(titles: string[] | string): Promise<ResObject> {
        const params: {
            action: string, generator?: string, gcmtitle?: string[] | string, 
            pageids?: string, titles?: string
        } = { action: 'purge' };

        if (typeof titles === 'string' && titles.startsWith('Category:')) {
            params.generator = 'categorymembers';
            params.gcmtitle = titles;
        } else {
            if (!Array.isArray(titles)) titles = [titles];
            if (typeof titles[0] === 'number') params.pageids = titles.join( '|' );
            else params.titles = titles.join( '|' );
        }

        return this.api.post(params);
    }

    /**
     * Sends an email to a user.
     * @param options - The options for the email.
     * @param options.user - The user to email.
     * @param options.subject - The subject of the email.
     * @param options.content - The content of the email.
     */
    email({ user, subject, content }: {
        user: string, subject: string, content: string
    }): Promise<ResObject> {
        return this.api.post({
            action: 'emailuser',
            target: user,
            subject,
            content,
            ccme: '',
        }, true);
    }

    /**
     * Get all edits by a user.
     * @param options - The options for the request.
     * @param options.user - The users to retrieve contributions for.
     * @param options.start - The start timestamp to return from.
     * @param options.namespace - Only list contributions in these namespaces.
     * @param options.onlyTitles - Whether to only list the page titles.
     */
    async getUserContribs({ user, start, namespace = '', onlyTitles = false }: {
        user: string,
        start: string,
        namespace?: string,
        onlyTitles?: boolean
    }): Promise<string[] | Record<string, unknown>> {
        const body = await this.api.get({
            action: 'query',
            list: 'usercontribs',
            ucuser: user,
            ucstart: start,
            uclimit: this.API_LIMIT,
            ucnamespace: namespace
        });

        if (onlyTitles) this.getList(body.query.usercontribs);
        return body.query.usercontribs;
    }

    /**
     * Creates a new account.
     * @param username - The username for the new account.
     * @param password - The password for the new account.
     */
    async createAccount(username: string, password: string): Promise<ResObject> {
        const body = await this.api.get({
            action: 'query',
            meta: 'tokens',
            type: 'createaccount'
        });

        return this.api.post({
            action: 'createaccount',
            createreturnurl: this.api.url,
            createtoken: body.tokens.createaccounttoken,
            username: username,
            password: password,
            retype: password
        });
    }

    /**
     * Moves a page.
     * @param options - The options for the move.
     * @param options.from - The page title to rename.
     * @param options.to - The new page title.
     * @param options.reason - The reason for moving this page.
     */
    move({ from, to, reason }: {
        from: string,
        to: string,
        reason: string
    }): Promise<ResObject> {
        return this.api.post({
            action: 'move',
            from,
            to,
            bot: '',
            reason,
        }, true);
    }

    /**
     * Gets all images on the wiki.
     * @param start - The image title to start enumerating from.
     * @param onlyTitles - Whether to only list the image titles.
     */
    async getImages(start: string, onlyTitles = false): Promise<string[] | ResObject[]> {
        const body = await this.api.get({
            action: 'query',
            list: 'allimages',
            aifrom: start,
            ailimit: this.API_LIMIT
        });

        if (onlyTitles) return this.getList(body.query.allimages);
        return body.query.allimages;
    }

    /**
     * Gets all images from an article.
     * @param options - The options for the request.
     * @param options.page - The page to get all its images from.
     * @param options.onlyTitles - Whether to only list the image titles.
     * @param options.otherOptions - Any other options for the request.
     */
    async getImagesFromArticle({ page, onlyTitles = false, otherOptions = {} }: {
        page: string,
        onlyTitles?: boolean,
        otherOptions?: Record<string, unknown>
    }): Promise<string[] | ResObject[]> {
        const body = await this.api.get({
            action: 'query',
            prop: 'images',
            titles: page,
            ...otherOptions
        });

        const article = this.getFirstItem(body.query.pages);

        if (onlyTitles) return this.getList(article.images);
        return article.images;
    }

    /**
     * Find all pages that use the given image title.
     * @param fileName - Title to search.
     * @param onlyTitles - Whether to only list the page titles.
     */
    async getImageUsage(fileName: string, onlyTitles = false): Promise<string[] | Record<string, unknown>[]> {
        const body = await this.api.get({
            action: 'query',
            list: 'imageusage',
            iutitle: fileName,
            iulimit: this.API_LIMIT
        });

        if (onlyTitles) return this.getList(body.query.imageusage);
        return body.query.imageusage;
    }

    /**
     * Gets information about the current user.
     */
    async whoAmI(): Promise<ResObject> {
        const body = await this.api.get({
            action: 'query',
            meta: 'userinfo',
            uiprop: 'groups|rights|ratelimits|editcount|realname|email'
        });

        return body.query.userinfo;
    }

    /**
     * Gets information about a given user.
     * @param username - The username of the account to look up.
     */
    whoIs(username: string): Promise<ResObject> {
        return this.whoAre([username]);
    }

    /**
     * Gets information about multiple users.
     * @param usernames - The usernames of the accounts to look up.
     */
    async whoAre(usernames: string[]): Promise<ResObject> {
        const body = await this.api.get({
            action: 'query',
            list: 'users',
            ususers: usernames.join( '|' ),
            usprop: 'blockinfo|groups|implicitgroups|rights|editcount|registration|emailable|gender'
        });

        return body.query.users;
    }

    /**
     * Expands all templates within wikitext.
     * @param text
     * @param title
     */
    async expandTemplates(text: string, title: string): Promise<string> {
        const body = await this.api.get({
            action: 'expandtemplates',
            text,
            title,
            prop: 'parsetree'
        });

        return body.expandtemplates.parsetree;
    }

    /**
     * Parses content and returns parser output.
     * @param text - Text to parse.
     * @param title - Title of page the text belongs to.
     */
    async parse(text: string, title: string): Promise<string> {
        const body = await this.api.get({
            action: 'parse',
            text,
            title,
            contentmodel: 'wikitext',
            disablelimitreport: true
        });

        return body.parse.text;
    }

    /**
     * Enumerate recent changes.
     * @param start - The timestamp to start enumerating from.
     * @param onlyTitles - Whether to only list the page titles.
     */
    async getRecentChanges(start = '', onlyTitles = false): Promise<string[] | ResObject[]> {
        const body = await this.api.get({
            action: 'query',
            list: 'recentchanges',
            rcprop: 'title|timestamp|comments|user|flags|sizes',
            rcstart: start,
            rclimit: this.API_LIMIT
        });

        if (onlyTitles) return this.getList(body.query.recentchanges);
        return body.query.recentchanges;
    }

    /**
     * Return general information about the site.
     * @param props - Which information to get.
     */
    async getSiteInfo(props: string | string[]): Promise<ResObject> {
        if (typeof props === 'string') props = [props];

        const body = await this.api.get({
            action: 'query',
            meta: 'siteinfo',
            siprop: props.join('|')
        });

        return body.query;
    }

    /**
     * Returns site statistics.
     */
    getSiteStats(): Promise<ResObject> {
        return this.getSiteInfo('statistics');
    }

    /**
     * Gets the wiki's MediaWiki version.
     */
    async getMwVersion(): Promise<string> {
        const siteInfo = await this.getSiteInfo('general');
        let version;

        version = siteInfo && siteInfo.general && siteInfo.general.generator;
        [version] = version.match(/[\d.]+/);

        return version;
    }

    /**
     * Returns a list of all pages from a query page.
     * @param queryPage - The query page.
     * @param onlyTitles - Whether to only list the page titles.
     */
    async getQueryPage(queryPage: string, onlyTitles = false): Promise<string[] | ResObject[]> {
        const body = await this.api.get({
            action: 'query',
            list: 'querypage',
            qppage: queryPage,
            qplimit: this.API_LIMIT
        });

        if (onlyTitles) return this.getList(body.query.querypage.results);
        return body.query.querypage.results;
    }

    /**
     * Returns all external URLs from the given page.
     * @param page - The page to get its external URLs from.
     */
    async getExternalLinks(page: string): Promise<string[]> {
        const body = await this.api.get({
            action: 'query',
            prop: 'extlinks',
            titles: page,
            ellimit: this.API_LIMIT
        });

        return this.getList(this.getFirstItem(body.query.pages).extlinks, '*');
    }

    /**
     * Find all pages that link to the given page.
     * @param page - Title to search.
     * @param onlyTitles - Whether to only list the page titles.
     */
    async getBackLinks(page: string, onlyTitles = false): Promise<string[] | ResObject[]> {
        const body = await this.api.get({
            action: 'query',
            list: 'backlinks',
            blnamespace: 0,
            bltitle: page,
            bllimit: this.API_LIMIT
        });

        if (onlyTitles) return this.getList(body.query.backlinks);
        return body.query.backlinks;
    }
}