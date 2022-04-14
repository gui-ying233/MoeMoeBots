const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const { CronJob } = require( "cron");
const bot = new MediaWikiJS(require('./config.json').mzh)
const action = 'query', prop = 'revisions', rvprop = 'content', generator = 'categorymembers', gcmnamespace = '-2|-1|0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829|2300|2302|2303', gcmlimit = 'max', tags = 'Bot', Bot = true
async function myFunc(gcmtitle, regex, replace) {
    try {
        const result1 = await bot.api.get({
            action,
            prop,
            rvprop,
            generator,
            gcmnamespace,
            gcmtitle,
            gcmlimit,
        })
        if (result1.query === undefined) {
            console.log('无页面');
        } else {
            console.log(`共${result1.query.pages.length}个页面。`)
            for (let i = 0; i < result1.query.pages.length; i++) {
                try {
                    console.log(`第${i+1}个页面：${result1.query.pages[i].title}。`);
                    const result2 = await bot.doEdit({
                        title: result1.query.pages[i].title,
                        text: result1.query.pages[i].revisions[0].content.replace(regex, replace),
                        summary: `自动修复[[${gcmtitle}]]中的页面`,
                        tags,
                        Bot,
                    });
                    console.log(result2.edit);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}
const cronJob=new CronJob({
        cronTime: "0 0/15 * 1/1 * *", // http://www.cronmaker.com/
        onTick: async () => {
            myFunc('CAT:错误使用标题格式化的页面', /{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]格式化}}\n?/gi, '');
            myFunc('CAT:需要更换为标题格式化的页面', /{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]替[换換].*?}}/gim, '{{标题格式化}}');
            myFunc('CAT:需要更换为小写标题的页面', /{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]替[换換].*?}}/gim, '{{小写标题}}');
            myFunc('CAT:不必要使用override参数的音乐条目', /\|override=1\n?/g, '');
            try {
                const result = await bot.api.get({
                    action,
                    prop,
                    rvprop,
                    generator,
                    gcmnamespace,
                    gcmtitle: 'CAT:错误使用标题替换模板的页面',
                    gcmlimit,
                    gcmendsortkeyprefix: "CAT:需要更换为",
                })
                if (result.query === undefined) {
                    console.log('无页面');
                } else {
                    console.log(`共${result.query.pages.length}个页面。`)
                    for (let i = 0; i < result.query.pages.length; i++) {
                        try {
                            console.log(`第${i+1}个页面：${result.query.pages[i].title}。`);
                            const result = await bot.doEdit({
                                title: result.query.pages[i].title,
                                text: result.query.pages[i].revisions[0].content.replace(/{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]替[换換].*?}}\n?/gim, ''),
                                summary: '自动修复[[CAT:错误使用标题替换模板的页面]]中的页面',
                                tags,
                                Bot,
                            });
                            console.log(result.edit);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
});
bot.login().then(() => cronJob.start());