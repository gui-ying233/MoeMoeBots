const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const config = require('./config.js')
const bot = new MediaWikiJS(config.zh)
const pageList = [
	'模块:Sandbox',
	'模块:Sandbox/test',
]
bot
	.login()
	.then(async () => {
		for (const title of pageList) {
			try {
				const result0 = await bot.doEdit({
					title,
					text: '',
					summary: '沙盒清理作业，若想保留较长时间，可以在个人测试区作测试，或者翻阅历史记录。',
					tags: 'Bot',
					Bot: true,
				});
				console.log(result0.edit.result, result0.edit.nochange ? '无更改' : '有更改');
			} catch (e0) {
				console.error(e0);
			}
		}
        try {
            const result1 = await bot.doEdit({
                title: 'H:沙盒/styles.css',
                text: '',
                summary: '沙盒清理作业，若想保留较长时间，可以在[[Special:我的用户页/Sandbox/styles.css|个人测试区]]作测试，或者翻阅历史记录。',
                tags: 'Bot',
                Bot: true,
            });
				console.log(result1.edit.result, result1.edit.nochange ? '无更改' : '有更改');
        } catch (e1) {
            console.error(e1);
        }
		try {
			const result2 = await bot.doEdit({
				title: 'T:沙盒/styles.css',
				text: '/* [[Category:在模板名字空间下的CSS页面]] */',
				summary: '沙盒清理作业，若想保留较长时间，可以在[[Special:我的用户页/Sandbox/styles.css|个人测试区]]作测试，或者翻阅历史记录。',
				tags: 'Bot',
				Bot: true,
			});
			console.log(result2.edit.result, result2.edit.nochange ? '无更改' : '有更改');
		} catch (e2) {
			console.error(e2);
		}
		try {
			const result3 = await bot.doEdit({
				title: 'H:沙盒/json',
				text: '{"warning":"请删除此行"}',
				summary: '沙盒清理作业，若想保留较长时间，可以在[[Special:我的用户页/Sandbox/json|个人测试区]]作测试，或者翻阅历史记录。',
				tags: 'Bot',
				Bot: true,
			});
			console.log(result3.edit.result, result3.edit.nochange ? '无更改' : '有更改');
		} catch (e3) {
			console.error(e3);
		}
	})