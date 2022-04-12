const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const bot = new MediaWikiJS({
	url: 'https://mzh.moegirl.org.cn/api.php',
	botUsername: '机娘鬼影233号@速记羽毛笔',
	botPassword: 'sk8adp6m2h8gp4c7nfktdihrmqpo9kde',
})
bot
	.login()
	.then(async () => {
		try {
			const result0 = await bot.api.get({
				action: 'query',
				prop: 'revisions',
				rvprop: 'content',
				// rvcontinue: '503041|5780974',
				generator: 'embeddedin',
				geititle: 'T:YoutubeCount',
				geilimit: 'max',
				geinamespace: '0',
			})
			for (let i = 0; i < result0.query.pages.length; i++) {
				try {
					console.log(`第${i + 1}/${result0.query.pages.length}个页面：${result0.query.pages[i].title}`);
					const result1 = await bot.doEdit({
						title: result0.query.pages[i].title,
						text: result0.query.pages[i].revisions[0].content.replace(/fallback *?= *?约?(\d{0,3})[,，]?\s?(\d{0,3})[,，]?\s?(\d{0,3})[,，]?\s?(\d{0,3})\s?[\+\-＋]?/g, 'fallback=$1$2$3$4'),
						summary: 'fallback参数更新',
						tags: 'Bot',
						Bot: true,
					});
					console.info(`${result1.edit.result}\n无更改：${result1.edit.nochange}`);
				} catch (e1) {
					console.error(e1);
				}
			}
		} catch (e0) {
			console.error(e0);
		}
	})
