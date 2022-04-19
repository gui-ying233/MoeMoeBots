const { MediaWikiJS } = require('@lavgup/mediawiki.js');
const bot = new MediaWikiJS(require('./config.json').prts);
const title = '假日威龙陈';
bot
	.login()
	.then(async () => {
		try {
			const result0 = await bot.api.get({
				action: 'query',
				prop: 'revisions',
				rvprop: 'content',
                titles: `${title}|${title}/语音记录`,
			})
			if (result0.query.pages[0].revisions[0].content.match(/{{异格干员\|原型=(.+?)}}\n/g) !== null) {
				var 异格 = result0.query.pages[0].revisions[0].content.match(/{{异格干员\|原型=(.+?)}}\n/g)[0].replace(/{{异格干员\|原型=(.+?)}}\n/g, `{{明日方舟info|异格前=$1}}
`)
			} else {
				var 异格 = '';
			}
			var wikitext0 = `{{标题格式化}}
{{明日方舟:导航}}
${异格}{{明日方舟info|'''<big><big>${result0.query.pages[1].revisions[0].content.match(/\|台词11={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词11={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}</big></big>'''}}
{{明日方舟人物信息
|image=
|图片说明=
|代号=${title}<br />${result0.query.pages[0].revisions[0].content.match(/\|干员外文名=(.+?)\n/g)[0].replace(/\|干员外文名=(.+?)\n/g, '$1')}
|本名=
|别号=
|性别=${result0.query.pages[0].revisions[0].content.match(/\|性别=(.+?)\n/g)[0].replace(/\|性别=(.+?)\n/g, '$1')}
|发色=
|瞳色=
|身高=${result0.query.pages[0].revisions[0].content.match(/\|身高=(.+?)\n/g)[0].replace(/\|身高=(.+?)\n/g, '$1')}
|体重=
|三围=
|年龄=
|生日=${result0.query.pages[0].revisions[0].content.match(/\|生日=(.+?)\n/g)[0].replace(/\|生日=(.+?)\n/g, '$1')}
|星座=
|血型=
|种族=[[明日方舟/种族#${result0.query.pages[0].revisions[0].content.match(/\|种族=(.+?)\n/g)[0].replace(/\|种族=(.+?)\n/g, '$1')}|${result0.query.pages[0].revisions[0].content.match(/\|种族=(.+?)\n/g)[0].replace(/\|种族=(.+?)\n/g, '$1')}]]
|职业=${result0.query.pages[0].revisions[0].content.match(/\|职业=(.+?)\n/g)[0].replace(/\|职业=(.+?)\n/g, '$1')}
|专精=
|画师=
|声优=
|萌点=
|出身地区=[[明日方舟:${result0.query.pages[0].revisions[0].content.match(/\|出身地=(.+?)\n/g)[0].replace(/\|出身地=(.+?)\n/g, '$1')}|${result0.query.pages[0].revisions[0].content.match(/\|出身地=(.+?)\n/g)[0].replace(/\|出身地=(.+?)\n/g, '$1')}]]
|活动范围=${(result0.query.pages[0].revisions[0].content.match(/\|所属组织=(.+?)\n/g) ? result0.query.pages[0].revisions[0].content.match(/\|所属组织=(.+?)\n/g)[0].replace(/\|所属组织=(.+?)\n/g, '$1') : (result0.query.pages[0].revisions[0].content.match(/\|所属国家=(.+?)\n/g) ? `${result0.query.pages[0].revisions[0].content.match(/\|所属国家=(.+?)\n/g)[0].replace(/\|所属国家=(.+?)\n/g, '$1')}` : ''))}
|所属团体=${(result0.query.pages[0].revisions[0].content.match(/\|所属团队=(.+?)\n/g) ? result0.query.pages[0].revisions[0].content.match(/\|所属团队=(.+?)\n/g)[0].replace(/\|所属团队=(.+?)\n/g, '$1') : '')}
|个人状态=
|相关人士=
}}

'''${title}'''是游戏'''《[[明日方舟]]》'''及其衍生作品的登场角色。

== 面板 ==
{{明日方舟干员
|中文名=${title}
|英文名=${result0.query.pages[0].revisions[0].content.match(/\|干员外文名=(.+?)\n/g)[0].replace(/\|干员外文名=(.+?)\n/g, '$1')}
|稀有度=${result0.query.pages[0].revisions[0].content.match(/\|稀有度=(.+?)\n/g)[0].replace(/\|稀有度=(.+?)\n/g, '$1')}
|画师=${result0.query.pages[0].revisions[0].content.match(/\|画师=(.+?)\n/g)[0].replace(/\|画师=(.+?)\n/g, '$1')}
|多位配音={{Cate|[[${result0.query.pages[0].revisions[0].content.match(/\|日文配音=(.+?)\n/g)[0].replace(/\|日文配音=(.+?)\n/g, '$1')}]]（日语）/ [[${result0.query.pages[0].revisions[0].content.match(/\|中文配音=(.+?)\n/g)[0].replace(/\|中文配音=(.+?)\n/g, '$1')}]]（汉语）|${result0.query.pages[0].revisions[0].content.match(/\|日文配音=(.+?)\n/g)[0].replace(/\|日文配音=(.+?)\n/g, '$1')}|${result0.query.pages[0].revisions[0].content.match(/\|中文配音=(.+?)\n/g)[0].replace(/\|中文配音=(.+?)\n/g, '$1')}}}
|势力=维多利亚
|差分类型=
|差分代号=
|时装=
|职业=${result0.query.pages[0].revisions[0].content.match(/\|职业=(.+?)\n/g)[0].replace(/\|职业=(.+?)\n/g, '$1')}
|初始范围=
|精1范围=
|精2范围=
|站位=${result0.query.pages[0].revisions[0].content.match(/\|位置=(.+?)\n/g)[0].replace(/\|位置=(.+?)\n/g, '$1')}
|标签=${result0.query.pages[0].revisions[0].content.match(/\|标签=(.+?)\n/g)[0].replace(/\|标签=(.+?)\n/g, '$1')}
|生命上限=${result0.query.pages[0].revisions[0].content.match(/\|精英0_1级_生命上限=(.+?)\n/g)[0].replace(/\|精英0_1级_生命上限=(.+?)\n/g, '$1')}/${result0.query.pages[0].revisions[0].content.match(/\|精英2_满级_生命上限=(.+?)\n/g)[0].replace(/\|精英2_满级_生命上限=(.+?)\n/g, '$1')}<span class="trusttext" title="信赖加成">（+${result0.query.pages[0].revisions[0].content.match(/\|信赖加成_生命上限=(.+?)\n/g)[0].replace(/\|信赖加成_生命上限=(.+?)\n/g, '$1')}）</span>
|攻击=${result0.query.pages[0].revisions[0].content.match(/\|精英0_1级_攻击=(.+?)\n/g)[0].replace(/\|精英0_1级_攻击=(.+?)\n/g, '$1')}/${result0.query.pages[0].revisions[0].content.match(/\|精英2_满级_攻击=(.+?)\n/g)[0].replace(/\|精英2_满级_攻击=(.+?)\n/g, '$1')}<span class="trusttext" title="信赖加成">（+${result0.query.pages[0].revisions[0].content.match(/\|信赖加成_攻击=(.+?)\n/g)[0].replace(/\|信赖加成_攻击=(.+?)\n/g, '$1')}）</span>
|防御=${result0.query.pages[0].revisions[0].content.match(/\|精英0_1级_防御=(.+?)\n/g)[0].replace(/\|精英0_1级_防御=(.+?)\n/g, '$1')}/${result0.query.pages[0].revisions[0].content.match(/\|精英2_满级_防御=(.+?)\n/g)[0].replace(/\|精英2_满级_防御=(.+?)\n/g, '$1')}<span class="trusttext" title="信赖加成">（+${result0.query.pages[0].revisions[0].content.match(/\|信赖加成_防御=(.+?)\n/g)[0].replace(/\|信赖加成_防御=(.+?)\n/g, '$1')}）</span>
|法术抗性=${result0.query.pages[0].revisions[0].content.match(/\|精英0_1级_法术抗性=(.+?)\n/g)[0].replace(/\|精英0_1级_法术抗性=(.+?)\n/g, '$1')}/${result0.query.pages[0].revisions[0].content.match(/\|精英2_满级_法术抗性=(.+?)\n/g)[0].replace(/\|精英2_满级_法术抗性=(.+?)\n/g, '$1')}
|再部署=${result0.query.pages[0].revisions[0].content.match(/\|再部署=(.+?)s\n/g)[0].replace(/\|再部署=(.+?)s\n/g, '$1')}秒
|部署费用=${result0.query.pages[0].revisions[0].content.match(/\|部署费用=(.+?)→(.+?)\n/g)[0].replace(/\|部署费用=(.+?)→(.+?)\n/g, '$1/$2')}
|阻挡数=${result0.query.pages[0].revisions[0].content.match(/\|阻挡数=(.+?)\n/g)[0].replace(/\|阻挡数=(.+?)\n/g, '$1')}
|攻击速度=${result0.query.pages[0].revisions[0].content.match(/\|攻击速度=(.+?)s\n/g)[0].replace(/\|攻击速度=(.+?)s\n/g, '$1')}秒
|技能1名称=${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能名=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能名=(.+?)\n/gs, '$1')}
|技能1触发={{明日方舟标签|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能类型1=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能类型1=(.+?)\n/gs, '$1')}}}{{明日方舟标签|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能类型2=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能类型2=(.+?)\n/gs, '$1')}}}
|技能1技力={{akspan|初始}} {{明日方舟技能条|color=blue|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能1初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能1初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能2初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能2初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能3初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能3初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能4初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能4初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能5初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能5初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能6初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能6初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能7初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能7初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精1初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精1初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精2初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精2初始=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精3初始=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精3初始=(.+?)\n/gs, '$1')}}} {{akspan|消耗}} {{明日方舟技能条|color=blue|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能1消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能1消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能2消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能2消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能3消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能3消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能4消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能4消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能5消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能5消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能6消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能6消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能7消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能7消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精1消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精1消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精2消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精2消耗=(.+?)\n/gs, '$1')}|${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精3消耗=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能专精3消耗=(.+?)\n/gs, '$1')}}}
|技能1=${result0.query.pages[0].revisions[0].content.match(/'''技能1（精英0开放）'''\n{{技能.+?\|技能1描述=(.+?)\n/gs)[0].replace(/'''技能1（精英0开放）'''\n{{技能.+?\|技能1描述=(.+?)\n/gs, '$1')}
|技能2名称=
|技能2触发=
|技能2技力=
|技能2=
|技能3名称=
|技能3触发=
|技能3技力=
|技能3=
|分支=${result0.query.pages[0].revisions[0].content.match(/\|子职业=(.+?)\n/g)[0].replace(/\|子职业=(.+?)\n/g, '$1')}
|特性=${result0.query.pages[0].revisions[0].content.match(/\|特性=(.+?)\n/g)[0].replace(/\|特性=(.+?)\n/g, '$1')}
|天赋1=<span class="talentblock">${result0.query.pages[0].revisions[0].content.match(/\|第一天赋1=(.+?)\n/g)[0].replace(/\|第一天赋1=(.+?)\n/g, '$1')}</span>（精英阶段1）${result0.query.pages[0].revisions[0].content.match(/\|第一天赋2效果=(.+?)\n/g)[0].replace(/\|第一天赋2效果=(.+?)\n/g, '$1').replace(/{{color\|#0098DC\|\((.+?)\)}}/g, '<span class="orangetext">（$1）</span>')}<br /><span class="talentblock">${result0.query.pages[0].revisions[0].content.match(/\|第一天赋4=(.+?)\n/g)[0].replace(/\|第一天赋4=(.+?)\n/g, '$1')}</span>（精英阶段2）${result0.query.pages[0].revisions[0].content.match(/\|第一天赋4效果=(.+?)\n/g)[0].replace(/\|第一天赋4效果=(.+?)\n/g, '$1').replace(/{{color\|#0098DC\|\((.+?)\)}}/g, '<span class="orangetext">（$1）</span>')}
|天赋2=
|后勤1图标=
|后勤1={{明日方舟标签||${result0.query.pages[0].revisions[0].content.match(/\|后勤技能1-1=(.+?)\n/g)[0].replace(/\|后勤技能1-1=(.+?)\n/g, '$1')}}}
|后勤2图标=
|后勤2=
|后勤3图标=
|后勤3={{明日方舟标签||${result0.query.pages[0].revisions[0].content.match(/\|后勤技能2-1=(.+?)\n/g)[0].replace(/\|后勤技能2-1=(.+?)\n/g, '$1')}}}（精英阶段2）
|雷达图文字1=${result0.query.pages[0].revisions[0].content.match(/\|物理强度=(.+?)\n/g)[0].replace(/\|物理强度=(.+?)\n/g, '$1')}
|雷达图文字2=${result0.query.pages[0].revisions[0].content.match(/\|战场机动=(.+?)\n/g)[0].replace(/\|战场机动=(.+?)\n/g, '$1')}
|雷达图文字3=${result0.query.pages[0].revisions[0].content.match(/\|生理耐受=(.+?)\n/g)[0].replace(/\|生理耐受=(.+?)\n/g, '$1')}
|雷达图文字4=${result0.query.pages[0].revisions[0].content.match(/\|战术规划=(.+?)\n/g)[0].replace(/\|战术规划=(.+?)\n/g, '$1')}
|雷达图文字5=${result0.query.pages[0].revisions[0].content.match(/\|战斗技巧=(.+?)\n/g)[0].replace(/\|战斗技巧=(.+?)\n/g, '$1')}
|雷达图文字6=${result0.query.pages[0].revisions[0].content.match(/\|源石技艺适应性=(.+?)\n/g)[0].replace(/\|源石技艺适应性=(.+?)\n/g, '$1')}
|潜能=${result0.query.pages[0].revisions[0].content.match(/\|潜能2=(.+?)\n/g)[0].replace(/\|潜能2=(.+?)\n/g, '$1')};${result0.query.pages[0].revisions[0].content.match(/\|潜能3=(.+?)\n/g)[0].replace(/\|潜能3=(.+?)\n/g, '$1')};${result0.query.pages[0].revisions[0].content.match(/\|潜能4=(.+?)\n/g)[0].replace(/\|潜能4=(.+?)\n/g, '$1')};${result0.query.pages[0].revisions[0].content.match(/\|潜能5=(.+?)\n/g)[0].replace(/\|潜能5=(.+?)\n/g, '$1')}; ${result0.query.pages[0].revisions[0].content.match(/\|潜能6=(.+?)\n/g)[0].replace(/\|潜能6=(.+?)\n/g, '$1')}
}}

== 招聘合同与信物 ==
{| class="wikitable" style="background:#f9f9f9"
|-
! 招聘合同
! {{Akitem|con|${title}|${result0.query.pages[0].revisions[0].content.match(/\|稀有度=(.+?)\n/g)[0].replace(/\|稀有度=(.+?)\n/g, '$1')}|size=50|unit=px}}
| ${result0.query.pages[0].revisions[0].content.match(/\|干员简介=(.+?)\n/g)[0].replace(/\|干员简介=(.+?)\n/g, '$1')}<br />''${result0.query.pages[0].revisions[0].content.match(/\|干员简介补充=(.+?)\n/g)[0].replace(/\|干员简介补充=(.+?)\n/g, '$1')}''
|-
! 信物
! {{Akitem|mat|${title}的信物|size=50|unit=px}}
| ${result0.query.pages[0].revisions[0].content.match(/\|信物用途=(.+?)\n/g)[0].replace(/\|信物用途=(.+?)\n/g, '$1')}<br />''${result0.query.pages[0].revisions[0].content.match(/\|信物描述=(.+?)\n/g)[0].replace(/\|信物描述=(.+?)\n/g, '$1')}''
|}

== 档案 ==
{| class="wikitable mw-collapsible mw-collapsed "
|-
! colspan=3 style="color:white;background:#333333"|'''人员档案'''
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案1=(.+?)\n/g)[0].replace(/\|档案1=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案1文本=(.+?)\n\|/gs)[0].replace(/\|档案1文本=(.+?)\n\|/gs, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案2=(.+?)\n/g)[0].replace(/\|档案2=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案2文本=(.+?)\n\|/gs)[0].replace(/\|档案2文本=(.+?)\n\|/gs, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案3=(.+?)\n/g)[0].replace(/\|档案3=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案3文本=(.+?)\n/g)[0].replace(/\|档案3文本=(.+?)\n/g, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案4=(.+?)\n/g)[0].replace(/\|档案4=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案4文本=(.+?)\n\|/gs)[0].replace(/\|档案4文本=(.+?)\n\|/gs, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案5=(.+?)\n/g)[0].replace(/\|档案5=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案5文本=(.+?)\n\|/gs)[0].replace(/\|档案5文本=(.+?)\n\|/gs, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案6=(.+?)\n/g)[0].replace(/\|档案6=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案6文本=(.+?)\n\|/gs)[0].replace(/\|档案6文本=(.+?)\n\|/gs, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案7=(.+?)\n/g)[0].replace(/\|档案7=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案7文本=(.+?)\n\|/gs)[0].replace(/\|档案7文本=(.+?)\n\|/gs, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案8=(.+?)\n/g)[0].replace(/\|档案8=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案8文本=(.+?)\n\|/gs)[0].replace(/\|档案8文本=(.+?)\n\|/gs, '$1')}
</poem>
|-
| style="color:white;background:#666"|'''${result0.query.pages[0].revisions[0].content.match(/\|档案9=(.+?)\n/g)[0].replace(/\|档案9=(.+?)\n/g, '$1')}'''
|-style="background:#f9f9f9"
|<poem>
${result0.query.pages[0].revisions[0].content.match(/\|档案9文本=(.+?)\n}}/gs)[0].replace(/\|档案9文本=(.+?)\n}}/gs, '$1')}
</poem>
|}`
var wikitext1 = `
== 角色台词 ==
{{Retext|N}}<br>{{Zhvoice}}
{| class="wikitable  mw-collapsible mw-collapsed " style="background:#f9f9f9"
|-
! colspan=4 style="color:white;background:#333333"|台词列表
|-
! 场合 !! 台词 !! 日文语音 !! 中文语音
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题1=(.+?)\n/g)[0].replace(/\|标题1=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词1={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词1={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_001.mp3</sm2>
| <sm2>HaiDi_zh_CN_001.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题2=(.+?)\n/g)[0].replace(/\|标题2=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词2={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词2={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_002.mp3</sm2>
| <sm2>HaiDi_zh_CN_002.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题3=(.+?)\n/g)[0].replace(/\|标题3=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词3={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词3={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_003.mp3</sm2>
| <sm2>HaiDi_zh_CN_003.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题4=(.+?)\n/g)[0].replace(/\|标题4=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词4={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词4={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_004.mp3</sm2>
| <sm2>HaiDi_zh_CN_004.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题5=(.+?)\n/g)[0].replace(/\|标题5=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词5={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词5={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_005.mp3</sm2>
| <sm2>HaiDi_zh_CN_005.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题6=(.+?)\n/g)[0].replace(/\|标题6=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词6={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词6={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_006.mp3</sm2>
| <sm2>HaiDi_zh_CN_006.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题7=(.+?)\n/g)[0].replace(/\|标题7=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词7={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词7={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_007.mp3</sm2>
| <sm2>HaiDi_zh_CN_007.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题8=(.+?)\n/g)[0].replace(/\|标题8=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词8={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词8={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_008.mp3</sm2>
| <sm2>HaiDi_zh_CN_008.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题9=(.+?)\n/g)[0].replace(/\|标题9=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词9={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词9={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_009.mp3</sm2>
| <sm2>HaiDi_zh_CN_009.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题10=(.+?)\n/g)[0].replace(/\|标题10=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词10={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词10={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_010.mp3</sm2>
| <sm2>HaiDi_zh_CN_010.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题11=(.+?)\n/g)[0].replace(/\|标题11=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词11={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词11={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_011.mp3</sm2>
| <sm2>HaiDi_zh_CN_011.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题12=(.+?)\n/g)[0].replace(/\|标题12=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词12={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词12={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_012.mp3</sm2>
| <sm2>HaiDi_zh_CN_012.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题13=(.+?)\n/g)[0].replace(/\|标题13=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词13={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词13={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_013.mp3</sm2>
| <sm2>HaiDi_zh_CN_013.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题14=(.+?)\n/g)[0].replace(/\|标题14=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词14={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词14={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_014.mp3</sm2>
| <sm2>HaiDi_zh_CN_014.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题17=(.+?)\n/g)[0].replace(/\|标题17=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词17={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词17={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_017.mp3</sm2>
| <sm2>HaiDi_zh_CN_017.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题18=(.+?)\n/g)[0].replace(/\|标题18=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词18={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词18={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_018.mp3</sm2>
| <sm2>HaiDi_zh_CN_018.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题19=(.+?)\n/g)[0].replace(/\|标题19=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词19={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词19={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_019.mp3</sm2>
| <sm2>HaiDi_zh_CN_019.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题20=(.+?)\n/g)[0].replace(/\|标题20=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词20={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词20={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_020.mp3</sm2>
| <sm2>HaiDi_zh_CN_020.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题21=(.+?)\n/g)[0].replace(/\|标题21=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词21={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词21={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_021.mp3</sm2>
| <sm2>HaiDi_zh_CN_021.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题22=(.+?)\n/g)[0].replace(/\|标题22=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词22={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词22={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_022.mp3</sm2>
| <sm2>HaiDi_zh_CN_022.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题23=(.+?)\n/g)[0].replace(/\|标题23=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词23={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词23={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_023.mp3</sm2>
| <sm2>HaiDi_zh_CN_023.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题24=(.+?)\n/g)[0].replace(/\|标题24=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词24={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词24={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_024.mp3</sm2>
| <sm2>HaiDi_zh_CN_024.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题25=(.+?)\n/g)[0].replace(/\|标题25=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词25={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词25={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_025.mp3</sm2>
| <sm2>HaiDi_zh_CN_025.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题26=(.+?)\n/g)[0].replace(/\|标题26=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词26={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词26={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_026.mp3</sm2>
| <sm2>HaiDi_zh_CN_026.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题27=(.+?)\n/g)[0].replace(/\|标题27=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词27={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词27={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_027.mp3</sm2>
| <sm2>HaiDi_zh_CN_027.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题28=(.+?)\n/g)[0].replace(/\|标题28=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词28={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词28={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_028.mp3</sm2>
| <sm2>HaiDi_zh_CN_028.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题29=(.+?)\n/g)[0].replace(/\|标题29=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词29={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词29={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_029.mp3</sm2>
| <sm2>HaiDi_zh_CN_029.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题30=(.+?)\n/g)[0].replace(/\|标题30=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词30={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词30={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_030.mp3</sm2>
| <sm2>HaiDi_zh_CN_030.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题31=(.+?)\n/g)[0].replace(/\|标题31=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词31={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词31={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_031.mp3</sm2>
| <sm2>HaiDi_zh_CN_031.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题32=(.+?)\n/g)[0].replace(/\|标题32=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词32={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词32={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_032.mp3</sm2>
| <sm2>HaiDi_zh_CN_032.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题33=(.+?)\n/g)[0].replace(/\|标题33=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词33={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词33={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_033.mp3</sm2>
| <sm2>HaiDi_zh_CN_033.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题34=(.+?)\n/g)[0].replace(/\|标题34=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词34={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词34={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_034.mp3</sm2>
| <sm2>HaiDi_zh_CN_034.mp3</sm2>
|- 
| ${result0.query.pages[1].revisions[0].content.match(/\|标题36=(.+?)\n/g)[0].replace(/\|标题36=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词36={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词36={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_036.mp3</sm2>
| <sm2>HaiDi_zh_CN_036.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题37=(.+?)\n/g)[0].replace(/\|标题37=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词37={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词37={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_037.mp3</sm2>
| <sm2>HaiDi_zh_CN_037.mp3</sm2>
|-
| ${result0.query.pages[1].revisions[0].content.match(/\|标题42=(.+?)\n/g)[0].replace(/\|标题42=(.+?)\n/g, '$1')}
| ${result0.query.pages[1].revisions[0].content.match(/\|台词42={{[Vv]oiceData\/word\|中文\|(.+?)}}/g)[0].replace(/\|台词42={{[Vv]oiceData\/word\|中文\|(.+?)}}/g, '$1')}
| <sm2>HaiDi_CN_042.mp3</sm2>
| <sm2>HaiDi_zh_CN_042.mp3</sm2>
|-
|}

==角色相关==
{| class="wikitable mw-collapsible mw-collapsed" style="width:450px"
|-
! style="color:white;background:#333333"|'''新干员 — 信息录入'''
|-
|{{Cquote|}}
{|style="float:left;width:100%;text-indent:1em;"
| 代号 ||style="background:#EDEFF2"| ${title}
|-
| 种族 ||style="background:#EDEFF2"| ${result0.query.pages[0].revisions[0].content.match(/\|种族=(.+?)\n/g)[0].replace(/\|种族=(.+?)\n/g, '$1')}
|-
| 出身 ||style="background:#EDEFF2"| ${result0.query.pages[0].revisions[0].content.match(/\|出身地=(.+?)\n/g)[0].replace(/\|出身地=(.+?)\n/g, '$1')}
|-
| 专精 ||style="background:#EDEFF2"| 
|}
|-
|<poem>

</poem>
|}

{{明日方舟|干员}}

==注释与外部链接==
<references />

[[分类:明日方舟]]`
			console.info(wikitext0);
			console.info(wikitext1);
        } catch (e0) {
			console.error(e0);
		}
    })
