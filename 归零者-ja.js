const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const config = require('./config.js')
const bot = new MediaWikiJS(config.ja)
bot
	.login()
	.then(async () => {
        try {
            const result0 = await bot.doEdit({
                title: 'ヘルプ:サンドボックス',
                text: '<noinclude>{{サンドボックス冒頭}}</noinclude>\n== ここから下に書き込んでください ==',
                summary: '砂場ならし',
                tags: 'Bot',
                Bot: true,
            });
            console.log(`${result0.edit.result}, 无更改：${result0.edit.nochange}`);
        } catch (e0) {
            console.error(e0);
        }
	})

