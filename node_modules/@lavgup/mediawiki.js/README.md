# mediawiki.js
`mediawiki.js` is a modern wrapper for the MediaWiki API, heavily inspired by [nodemw](https://github.com/macbre/nodemw).
This library's focus is modernness, so it includes TypeScript support.

## Installation
```shell
$ pnpm add @lavgup/mediawiki.js
# or
$ npm install @lavgup/mediawiki.js
# or
$ yarn add @lavgup/mediawiki.js
```

## Usage
`mediawiki.js` uses promises with async/await syntax instead of callbacks.

### Initiating the client
`mediawiki.js` requires a configuration object, containing the following things;

* url: The URL of the wiki's api.php file.

The following constructor parameters can be set if the bot's credentials are known when instantiating the bot class.

If not, the login function takes a username and password parameter, to support switching accounts easily.

* botUsername: username for when `login()` is called (optional)
* botPassword: password for when `login()` is called (optional, see Special:BotPasswords for this)

#### Example
```js
const { MediaWikiJS } = require('@lavgup/mediawiki.js');

// Because bot username and password are provided here,
// you won't need to specify parameters to login().
const bot = new MediaWikiJS({
	url: 'https://en.wikipedia.org/w/api.php',
	botUsername: 'Username@Bot Username',
	botPassword: ''
});
```

### Using methods
All methods are internally documented using JSDoc, so you should just be able to browse
through [MediaWikiJS.ts](src/MediaWikiJS.ts) to know what you need to know.

#### Examples
##### Getting site statistics
```js
const stats = await bot.getSiteStats();

console.log(stats);
// => { ... }
```

##### Getting titles of all pages in a category
```js
    const pages = await bot.getPagesInCategory('Stubs', true);

console.log(pages);
// => [ ... ]
```

##### Editing a page
```js
    // login
await bot.login('username', 'password');

// prepend content (add to start of page)
await bot.prepend({
	title: 'Project:Sandbox',
	content: "Don't vandalise the sandbox!",
	summary: 'Add notice',
	minor: true
});

// append content (add to end of page)
await bot.append({
	title: 'Project:Sandbox',
	content: '[[Category:Meta]]',
	summary: '+meta cat'
});

// replace/create page with content
await bot.edit({
	title: 'Project:Sandbox',
	content: 'test',
	summary: 'testing!'
});
```

##### Deleting a page
```js
await bot.login('username', 'password');

await bot.delete({
	title: 'Project:Sandbox',
	reason: 'Testing mediawiki.js!'
});
```

##### Blocking a user
```js
await bot.login('username', 'password');

await bot.block({
	user: 'Jimmy Wales',
	expiry: '1 hour',
	reason: 'Vandalism :(',
	allowUserTalk: false,
	autoblock: false,
	reblock: true
});
```

##### Protecting a page
```js
await bot.login('username', 'password');

await bot.protect({
	title: 'Project:Rules',
	protections: {
		edit: 'sysop',
		move: 'sysop'
	},
	expiry: 'never',
	reason: 'Special page!',
	cascade: true
});
```

## Running tests
[Jest](https://jestjs.io) is the testing library used for this project, so you can run all tests by running `pnpm test`
in the root directory. Note that you will have to provide configuration for tests, including the URL to a test wiki's
api.php file and a pair of BotPassword credentials. There is a sample configuration file provided.

## Example application
* [Wiki Utilities](https://github.com/lavgup/wiki-utilities) - Discord bot for taking administrative actions on a wiki through message commands.

## Support and questions
Open an issue!
Join my [Discord server](https://discord.gg/3hsdQhYVKT) for a quicker response.

## Contributing
Open a PR! Might be worth opening an issue if it's a major change, to get the heads up from me.
