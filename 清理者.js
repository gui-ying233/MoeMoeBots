"use strict"

const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const { CronJob } = require( 'cron');
const bot = new MediaWikiJS(require('./config.json').mzh)
async function cleaner(gcmtitle, regex, replace = '', skipTitle = /^$/) {
	try {
		const result1 = await bot.api.get({
			action: 'query',
			curtimestamp: 1,
			prop: 'revisions',
			rvprop: 'content|timestamp',
			generator: 'categorymembers',
			gcmnamespace: '-2|-1|0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829|2300|2302|2303',
			gcmlimit: 'max',
			gcmtitle,
		})
		if (result1.query === undefined) {
			console.log('无页面');
		} else {
			console.log(`${gcmtitle}中共${result1.query.pages.length}个页面。`)
			for (let i = 0; i < result1.query.pages.length; i++) {
				console.log(`第${i+1}个页面：${result1.query.pages[i].title}`);
				if (new RegExp(/^(?:Template:Sandbox|Template:沙盒|模块:Sandbox)\//).test(result1.query.pages[i].title) || new RegExp(skipTitle).test(result1.query.pages[i].title)) {
					console.log("跳过页面");
				} else if (result1.query.pages[i].revisions[0].content.match(/{{:?(?:Template:|[模样樣]板:|T:)?(?:施工中|[编編][辑輯]中|inuse)/gi) !== null) {
					console.log("施工中");
				} else {
					try {
						const result2 = await bot.doEdit({
							title: result1.query.pages[i].title,
							text: result1.query.pages[i].revisions[0].content.replace(regex, replace),
							summary: `自动修复[[${gcmtitle}]]中的页面`,
							tags: 'Bot',
							Bot: true, 
							basetimestamp: result1.query.pages[i].revisions[0].timestamp,
							starttimestamp: result1.curtimestamp,
						});
						console.log(result2.edit);
						if (result2.edit.nochange !== true) {
							console.info(`https://zh.moegirl.org.cn/Special:Diff/${result2.edit.oldrevid}/${result2.edit.newrevid}`)
						}
					} catch (e) {
						console.error(e);
					}
				}
			}
		}
	} catch (e) {
		console.error(e);
	}
}
const cronJob=new CronJob({
		cronTime: '0 0/30 * 1/1 * *', // http://www.cronmaker.com/
		onTick: async () => {
			var d = new Date()
			console.log(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,0)}-${String(d.getDate()).padStart(2,0)} ${String(d.getHours()).padStart(2,0)}:${String(d.getMinutes()).padStart(2,0)}:${String(d.getSeconds()).padStart(2,0)}`);
			await cleaner('CAT:错误使用标题格式化的页面', /{{:?(?:Template:|[模样樣]板:|T:)?[标標][题題]格式化}}\n?/gi);
			await cleaner('CAT:需要更换为标题格式化的页面', /{{:?(?:Template:|[模样樣]板:|T:)?[标標][题題]替[换換].*?}}/gis, '{{标题格式化}}');
			await cleaner('CAT:需要更换为小写标题的页面', /{{:?(?:Template:|[模样樣]板:|T:)?[标標][题題]替[换換].*?}}/gis, '{{小写标题}}');
			await cleaner('CAT:不必要使用override参数的音乐条目', /\|override=1\n?/g);
			await cleaner('CAT:错误使用标题替换模板的页面', /{{:?(?:Template:|[模样樣]板:|T:)?[标標][题題]替[换換].*?}}\n?/gis, '', /^Category:需要更换为(?:标题格式化|小写标题)的页面$/);
		} 
});
bot.login().then(() => cronJob.start());
