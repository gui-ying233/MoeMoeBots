const { MediaWikiJS } = require('@lavgup/mediawiki.js')
const config = require('./config.js')
const bot = new MediaWikiJS(config.zh)
bot
    .login()
    .then(async () => {
        try {
            const result0 = await bot.api.get({
                action: 'query',
                prop: 'links',
                titles: 'User talk:鬼影233/唱唱反调',
                pllimit: 'max',
            })
            console.log(`共${result0.query.pages[0].links.length}个页面。`);
            for (let i = 0; i < result0.query.pages[0].links.length; i++) {
                try {
                    console.log(`第${i+1}个页面：${result0.query.pages[0].links[i].title}。`);
                    const result1 = await bot.doEdit({
                        title: result0.query.pages[0].links[i].title,
                        appendtext: '{{safesubst:U:鬼影233/唱唱反调}}<span style="display:none;">{{mute|{{safesubst:ROOTPAGENAME}}}} 无情的期刊发送笔~~~</span>',
                        summary: '速记羽毛笔：新一期的《唱唱反调》已送达，请注意查收~',
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
    })
