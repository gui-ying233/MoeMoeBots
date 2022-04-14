const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const { CronJob } = require("cron");
const config = require('./config.js')
const bot = new MediaWikiJS(config.mzh)
const cronJob=new CronJob({
        cronTime: "0 0/15 * 1/1 * *", // http://www.cronmaker.com/
        onTick: async () => {
            try {
                const result0 = await bot.api.get({
                    action: 'query',
                    prop: 'revisions',
                    rvprop: 'content',
                    generator: 'categorymembers',
                    gcmnamespace: '-2|-1|0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829|2300|2302|2303',
                    gcmtitle: 'CAT:错误使用标题格式化的页面',
                    gcmlimit: 'max',
                })
                console.log(`共${result0.query.pages.length}个页面。`)
                for (let i = 0; i < result0.query.pages.length; i++) {
                    try {
                        console.log(`第${i+1}个页面：${result0.query.pages[i].title}。`);
                        const result1 = await bot.doEdit({
                            title: result0.query.pages[i].title,
                            text: result0.query.pages[i].revisions[0].content.replace(/{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]格式化}}\n?/gi, ''),
                            summary: '自动修复[[CAT:错误使用标题格式化的页面]]中的页面',
                            tags: 'Bot',
                            Bot: true,
                        });
                        console.log(result1.edit);
                    } catch (e1) {
                        console.error(e1);
                    }
                }
            } catch (e0) {
                console.error(e0);
            }
            try {
                const result2 = await bot.api.get({
                    action: 'query',
                    prop: 'revisions',
                    rvprop: 'content',
                    generator: 'categorymembers',
                    gcmnamespace: '-2|-1|0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829|2300|2302|2303',
                    gcmtitle: 'CAT:错误使用标题格式化的页面',
                    gcmlimit: 'max',
                    gcmendsortkeyprefix: "CAT:需要更换为",
                })
                console.log(`共${result2.query.pages.length}个页面。`)
                for (let i = 0; i < result2.query.pages.length; i++) {
                    try {
                        console.log(`第${i+1}个页面：${result2.query.pages[i].title}。`);
                        const result3 = await bot.doEdit({
                            title: result2.query.pages[i].title,
                            text: result2.query.pages[i].revisions[0].content.replace(/{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]替[换換].*?}}\n?/gim, ''),
                            summary: '自动修复[[CAT:错误使用标题格式化的页面]]中的页面',
                            tags: 'Bot',
                            Bot: true,
                        });
                        console.log(result3.edit);
                    } catch (e3) {
                        console.error(e3);
                    }
                }
            } catch (e2) {
                console.error(e2);
            }
            try {
                const result4 = await bot.api.get({
                    action: 'query',
                    prop: 'revisions',
                    rvprop: 'content',
                    generator: 'categorymembers',
                    gcmnamespace: '-2|-1|0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829|2300|2302|2303',
                    gcmtitle: 'CAT:需要更换为标题格式化的页面',
                    gcmlimit: 'max',
                })
                console.log(`共${result4.query.pages.length}个页面。`)
                for (let i = 0; i < result4.query.pages.length; i++) {
                    try {
                        console.log(`第${i+1}个页面：${result4.query.pages[i].title}。`);
                        const result5 = await bot.doEdit({
                            title: result4.query.pages[i].title,
                            text: result4.query.pages[i].revisions[0].content.replace(/{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]替[换換].*?}}/gim, '{{标题格式化}}'),
                            summary: '自动修复[[CAT:需要更换为标题格式化的页面]]中的页面',
                            tags: 'Bot',
                            Bot: true,
                        });
                        console.log(result5.edit);
                    } catch (e5) {
                        console.error(e5);
                    }
                }
            } catch (e4) {
                console.error(e4);
            }
            try {
                const result6 = await bot.api.get({
                    action: 'query',
                    prop: 'revisions',
                    rvprop: 'content',
                    generator: 'categorymembers',
                    gcmnamespace: '-2|-1|0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829|2300|2302|2303',
                    gcmtitle: 'CAT:需要更换为小写标题的页面',
                    gcmlimit: 'max',
                })
                console.log(`共${result6.query.pages.length}个页面。`)
                for (let i = 0; i < result6.query.pages.length; i++) {
                    try {
                        console.log(`第${i+1}个页面：${result6.query.pages[i].title}。`);
                        const result7 = await bot.doEdit({
                            title: result6.query.pages[i].title,
                            text: result6.query.pages[i].revisions[0].content.replace(/{{:?(?:template:|模板:|[样樣]板:|t:)?[标標][题題]替[换換].*?}}/gim, '{{小写标题}}'),
                            summary: '自动修复[[CAT:需要更换为小写标题的页面]]中的页面',
                            tags: 'Bot',
                            Bot: true,
                        });
                        console.log(result7.edit);
                    } catch (e7) {
                        console.error(e7);
                    }
                }
            } catch (e6) {
                console.error(e6);
            }
            try {
                const result8 = await bot.api.get({
                    action: 'query',
                    prop: 'revisions',
                    rvprop: 'content',
                    generator: 'categorymembers',
                    gcmnamespace: '-2|-1|0|1|4|5|6|7|8|9|10|11|12|13|14|15|274|275|710|711|828|829|2300|2302|2303',
                    gcmtitle: 'CAT:不必要使用override参数的音乐条目',
                    gcmlimit: 'max',
                })
                console.log(`共${result8.query.pages.length}个页面。`)
                for (let i = 0; i < result8.query.pages.length; i++) {
                    try {
                        console.log(`第${i+1}个页面：${result6.query.pages[i].title}。`);
                        const result9 = await bot.doEdit({
                            title: result8.query.pages[i].title,
                            text: result8.query.pages[i].revisions[0].content.replace(/\|override=1\n?/g, ''),
                            summary: '自动修复[[CAT:不必要使用override参数的音乐条目]]中的页面',
                            tags: 'Bot',
                            Bot: true,
                        });
                        console.log(result9.edit);
                    } catch (e9) {
                        console.error(e9);
                    }
                }
            } catch (e8) {
                console.error(e8);
            }
        }
});
bot.login().then(() => cronJob.start());