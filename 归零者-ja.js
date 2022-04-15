const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const bot = new MediaWikiJS(require('./config.json').ja)
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
			console.log(result0.edit.result, result0.edit.nochange ? '无更改' : '有更改');
		} catch (e0) {
			console.error(e0);
		}
	})