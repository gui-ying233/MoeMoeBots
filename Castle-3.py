import requests
from re import findall, S, sub, match, search
from pypinyin import pinyin, Style
from os import sep

output1 = output2 = 异格 = 种族 = 出身地区 = 异格任务 = 配音 = 初始范围 = 精1范围 = 精2范围 = 生命上限加成 = 攻击加成 = 防御加成 = 潜能 = 技能1触发 = 技能2触发 = 技能3触发 = 技能1持续 = 技能2持续 = 技能3持续 = 技能1初始 = 技能2初始 = 技能3初始 = 技能1技力 = 技能2技力 = 技能3技力 = 天赋1 = 天赋2 = 后勤2 = 后勤3 = 后勤1图标 = 后勤2图标 = 后勤3图标 = 档案 = 语音 = ''

术语释义={

#战斗术语

    #状态

    '{{术语|ba.sluggish|停顿}}':'移动速度降低80%',

    '{{术语|ba.root|束缚}}':'无法移动',

    '{{术语|ba.stun|晕眩}}':'无法移动、阻挡、攻击及使用技能',

    '{{术语|ba.buffres|链接=可抵抗状态|抵抗}}':'<span style="border-bottom:1px solid;">晕眩</span>、<span style="border-bottom:1px solid;">寒冷</span>、<span style="border-bottom:1px solid;">冻结</span>等负面状态的持续时间减半（同名效果不叠加）',

    '{{术语|ba.invisible|隐匿}}':'不阻挡时不成为敌方攻击的目标',

    '{{术语|ba.camou|迷彩}}':'不阻挡时不成为敌方普通攻击的目标',

    '{{术语|ba.fragile|脆弱}}':'受到的所有伤害提升相应比例（同名效果取最高）',

    '{{术语|ba.magicfragile|法术脆弱}}':'受到的法术伤害提升相应比例（同名效果取最高）',

    '{{术语|ba.dying|重伤}}':'移速下降且无法被阻挡，10秒后自然死亡，被击杀后使击杀者回复数点技力',

    '{{术语|ba.barrier|屏障}}':'可以吸收一定数值的伤害',

    '{{术语|ba.shield|护盾}}':'每层护盾可以抵挡一次伤害',

    '{{术语|ba.physhield|物理护盾}}':'每层物理护盾可以抵挡一次物理伤害<br/>※护盾成功抵挡伤害时，该次攻击视为被抵挡。',

    '{{术语|ba.protect|庇护}}':'受到的物理和法术伤害降低相应比例（同名效果取最高）',

    '{{术语|ba.cold|寒冷}}':'攻击速度下降30，如果在持续时间内再次受到寒冷效果则会变为<span style="border-bottom:1px solid;">冻结</span>',

    '{{术语|ba.frozen|冻结}}':'无法移动、攻击及使用技能',

    '{{术语|ba.sleep|沉睡}}':'无敌且无法行动',

    '{{术语|ba.inspire|鼓舞}}':'获得额外附加的基础属性加成（同类属性取最高）',

    '{{术语|ba.float|近地悬浮}}':'无法被阻挡或近战攻击',

    '{{术语|ba.refraction|折射}}':'生效时，法术抗性+70',

    '{{术语|ba.debuff|异常状态}}':'包括<span style="border-bottom:1px solid;">晕眩</span>、<span style="border-bottom:1px solid;">寒冷</span>、<span style="border-bottom:1px solid;">冻结</span>等',

    '{{术语|ba.levitate|浮空}}':'变为空中单位，无法移动、攻击及使用技能；对重量大于3的单位持续时间减半',

    #技能相关

    '{{术语|ba.binding|绑定}}':'绑定对象不在场时技能强制结束，清空所有技力且无法回复技力',

    '{{术语|ba.charged|蓄力}}':'技力达到上限可继续回复，回复至上限2倍时进入蓄力状态，此时开启技能会触发额外效果（任何时候开启均消耗全部技力）',

    '{{术语|ba.overdrive|过载}}':'技能持续拥有两段计量槽，技能进行到一半时触发额外效果',

    '{{术语|ba.strong|精力充沛}}':'生命值高于一定比例时攻击力加成提升相应比例（同名效果攻击力加成取最高）',

    #元素相关

    '{{术语|ba.dt.element|元素损伤}}':'包括<span style="border-bottom:1px solid;">神经损伤</span>、<span style="border-bottom:1px solid;">侵蚀损伤</span>、<span style="border-bottom:1px solid;">灼燃损伤</span>、<span style="border-bottom:1px solid;">凋亡损伤</span>',

    '{{术语|ba.dt.neural|神经损伤}}':'神经损伤累计至1000时，受到1000点真实伤害并晕眩10秒',

    '{{术语|ba.dt.erosion|侵蚀损伤}}':'侵蚀损伤累计至1000时，永久降低100点防御力并受到800点物理伤害',

    '{{术语|ba.dt.burning|灼燃损伤}}':'灼燃损伤累计至1000时，10秒内降低20法术抗性并受到1200点法术伤害',

    '{{术语|dt.apoptosis|凋亡损伤}}':'凋亡损伤累计至1000时，15秒内无法开启技能，每秒损失1点技力并受到100点法术伤害',

#基建术语

    #中间产物

    '{{术语|cc.bd_A_1|念力}}':'拥有该基建技能的干员<br>迷迭香',

    '{{术语|cc.bd_A_2|意识实体}}':'拥有该基建技能的干员<br>迷迭香',

    '{{术语|cc.bd_B_1|徘徊旋律}}':'拥有该基建技能的干员<br>黑键',

    '{{术语|cc.bd_B_2|怅惘和声}}':'拥有该基建技能的干员<br>黑键',

    '{{术语|cc.bd_A|思维链环}}':'可影响<span style="border-bottom:1px solid;">{{color|orange|念力}}</span>、<span style="border-bottom:1px solid;">{{color|orange|意识实体}}</span>相关技能<br>由以下干员的基建技能提供<br>迷迭香',

    '{{术语|cc.bd_B|无声共鸣}}':'可影响<span style="border-bottom:1px solid;">{{color|orange|徘徊旋律}}</span>、<span style="border-bottom:1px solid;">{{color|orange|怅惘和声}}</span>相关技能<br>由以下干员的基建技能提供<br>黑键',

    '{{术语|cc.bd_a1|感知信息}}':'可影响<span style="border-bottom:1px solid;">{{color|orange|思维链环}}</span>、<span style="border-bottom:1px solid;">{{color|orange|无声共鸣}}</span>相关变量<br>由以下干员的基建技能提供<br>迷迭香、黑键、夕、令、絮雨、爱丽丝、车尔尼',

    '{{术语|cc.bd_b1|人间烟火}}':'由以下干员提供<br>夕、令、乌有、桑葚',

    '{{术语|cc.bd_ash|情报储备}}':'由以下干员提供<br>灰烬',

    '{{术语|cc.bd_tachanka|乌萨斯特饮}}':'由以下干员提供<br>战车',

    '{{术语|cc.bd_a1_a1|记忆碎片}}':'可影响{{color|orange|感知信息}}相关变量<br>由以下干员的基建技能提供<br>絮雨',

    '{{术语|cc.bd_a1_a2|梦境}}':'可影响{{color|orange|感知信息}}相关变量<br>由以下干员的基建技能提供<br>爱丽丝',

    '{{术语|cc.bd_a1_a3|小节}}':'可影响{{color|orange|感知信息}}相关变量<br>由以下干员的基建技能提供<br>车尔尼',

    '{{术语|cc.w.ncdeer1|因果}}':'每当加工心情消耗{{color|blue|4}}以下的配方未产出副产品时，所消耗的每{{color|blue|1}}点心情转化为{{color|blue|1}}点{{color|blue|因果}}',

    '{{术语|cc.w.ncdeer2|业报}}':'每当加工心情消耗{{color|blue|8}}的配方未产出副产品时，所消耗的每{{color|blue|1}}点心情转化为{{color|blue|1}}点{{color|blue|业报}}',

    '{{术语|cc.bd_malist|工程机器人}}':'由以下干员的基建技能提供<br>至简',

    '{{术语|cc.bd.costdrop|心情落差}}':'干员自身心情上限与当前心情值的差值',

    #技能

    '{{术语|cc.m.var1|回收利用}}':'拥有该基建技能的干员<br>红云',

    '{{术语|cc.m.var2|配合意识}}':'拥有该基建技能的干员<br>槐琥',

    '{{术语|cc.t.snsant1|天道酬勤·α}}':'拥有该基建技能的干员<br>雪雉',

    '{{术语|cc.t.snsant2|天道酬勤·β}}':'拥有该基建技能的干员<br>雪雉',

    '{{术语|cc.m.pow1|自动化·α}}':'由以下干员提供<br>温蒂、森蚺、异客',

    '{{术语|cc.m.pow2|自动化·β}}':'由以下干员提供<br>森蚺',

    '{{术语|cc.m.pow3|仿生海龙}}':'由以下干员提供<br>温蒂',

    '{{术语|cc.sk.manu1|标准化类技能}}':'包含以下技能<br/>标准化·α、标准化·β',

    '{{术语|cc.sk.manu2|莱茵科技类技能}}':'包含以下技能<br>莱茵科技·α、莱茵科技·β',

    '{{术语|cc.sk.manu3|红松骑士团类技能}}':'包含以下技能<br>红松骑士团·α、红松骑士团·β',

    #设施

    '{{术语|cc.t.flow_gold|赤金生产线}}':'每有{{color|blue|1}}间{{color|blue|制造站}}生产{{color|blue|赤金}}，则赤金生产线{{color|blue|+1}}',

    #干员分类

    '{{术语|cc.g.lgd|龙门近卫局}}':'包含以下干员<br>陈、星熊、诗怀雅',

    '{{术语|cc.g.lda|鲤氏侦探事务所}}':'包含以下干员<br>老鲤、阿、吽、槐琥',

    '{{术语|cc.g.ussg|乌萨斯学生自治团}}':'包含以下干员<br>早露、凛冬、真理、古米',

    '{{术语|cc.g.R6|彩虹小队}}':'包含以下干员<br>灰烬、战车、闪击、霜华',

    '{{术语|cc.g.sp|异格}}':'包含所有异格干员',

    '{{术语|cc.g.abyssal|深海猎人}}':'包含以下干员<br>歌蕾蒂娅、斯卡蒂、幽灵鲨、安哲拉',

    '{{术语|cc.tag.op|作业平台}}':'包含以下干员<br>Lancet-2、Castle-3、THRM-EX、正义骑士号',

    '{{术语|cc.g.psk|红松骑士团}}':'包含以下干员<br>焰尾、远牙、灰毫、野鬃、正义骑士号',

    '{{术语|cc.tag.knight|骑士}}':'包含以下干员<br>耀骑士临光、临光、瑕光、鞭刃、焰尾、远牙、灰毫、野鬃、正义骑士号、砾',

    '{{术语|cc.g.karlan|喀兰贸易}}':'包含以下干员<br>银灰、灵知、初雪、崖心、角峰、讯使、耶拉、极光',

    '{{术语|cc.g.sui|岁}}':'包含以下干员<br>年、夕、令',

    '{{术语|cc.tag.durin|杜林族}}':'包含以下干员<br>至简、桃金娘、褐果、杜林',

    '{{术语|cc.gvial|嘉维尔}}':'包含以下干员<br>百炼嘉维尔、嘉维尔',

    #特殊

    '{{术语|cc.c.abyssal2_1|特殊加成}}':'每有1个{{术语|cc.g.abyssal|{{color|blue|深海猎人}}}}干员进驻制造站，则控制中枢给每个进驻{{术语|cc.g.abyssal|{{color|blue|深海猎人}}}}的制造站提供{{color|blue|5%}}生产力，最多给单个制造站提供{{color|blue|45%}}生产力',

    '{{术语|cc.c.abyssal2_2|特殊加成}}':'每有1个{{术语|cc.g.abyssal|{{color|blue|深海猎人}}}}干员进驻制造站，则控制中枢给每个进驻{{术语|cc.g.abyssal|{{color|blue|深海猎人}}}}的制造站提供{{color|blue|10%}}生产力，最多给单个制造站提供{{color|blue|90%}}生产力',

    '{{术语|cc.c.abyssal2_3|特殊叠加规则}}':'无法与{{术语|cc.m.var2|{{color|orange|配合意识}}}}进行叠加，且优先生效<br>无法与{{术语|cc.m.pow1|{{color|orange|自 动 化·α}}}}、{{术语|cc.m.pow2|{{color|orange|自动化·β}}}}、{{术语|cc.m.pow3|{{color|orange|仿生海龙}}}}进行叠加，且清零效果优先生效',

    '{{术语|cc.t.strong2|特殊叠加规则}}':'无法单独与{{术语|cc.t.snsant1|{{color|orange|天道酬勤·α}}}}、{{术语|cc.t.snsant2|{{color|orange|天道酬勤·β}}}}进行叠加，且优先生效<br>当{{术语|cc.t.snsant1|{{color|orange|天道酬勤·α}}}}、{{术语|cc.t.snsant2|{{color|orange|天道酬勤·β}}}}与其他技能进行叠加时，该技能会对此叠加效果进行叠加',

    '{{术语|cc.c.room1|部分设施}}':'包含以下设施<br>发电站、人力办公室、会客室',

    '{{术语|cc.c.room2|其他设施}}':'包含以下设施<br>发电站、制造站、贸易站、人力办公室、会客室',

    '{{术语|cc.c.skill|部分技能}}':'包含以下技能<br>左膀右臂、S.W.E.E.P.、零食网络、清理协议、替身、必要责任、护卫、小小的领袖、独善其身',
}

术语字典={
    
    #状态

    'ba.sluggish':'停顿',

    'ba.root':'束缚',

    'ba.stun':'晕眩',

    'ba.buffres':'链接=可抵抗状态|抵抗',

    'ba.invisible':'隐匿',

    'ba.camou':'迷彩',

    'ba.fragile':'脆弱',

    'ba.magicfragile':'法术脆弱',

    'ba.dying':'重伤',

    'ba.barrier':'屏障',

    'ba.shield':'护盾',

    'ba.physhield':'物理护盾',

    'ba.protect':'庇护',

    'ba.cold':'寒冷',

    'ba.frozen':'冻结',

    'ba.sleep':'沉睡',

    'ba.inspire':'鼓舞',

    'ba.float':'近地悬浮',

    'ba.refraction':'折射',

    'ba.debuff':'异常状态',

    'ba.levitate':'浮空',

    #技能相关

    'ba.binding':'绑定',

    'ba.charged':'蓄力',

    'ba.overdrive':'过载',

    'ba.strong':'精力充沛',

    #元素相关

    'ba.dt.element':'元素损伤',

    'ba.dt.neural':'神经损伤',

    'ba.dt.erosion':'侵蚀损伤',

    'ba.dt.burning':'灼燃损伤',

    'dt.apoptosis':'凋亡损伤',

    #基建术语

    #中间产物

    'cc.bd_A_1':'念力',

    'cc.bd_A_2':'意识实体',

    'cc.bd_B_1':'徘徊旋律',

    'cc.bd_B_2':'怅惘和声',

    'cc.bd_A':'思维链环',

    'cc.bd_B':'无声共鸣',

    'cc.bd_a1':'感知信息',

    'cc.bd_b1':'人间烟火',

    'cc.bd_ash':'情报储备',

    'cc.bd_tachanka':'乌萨斯特饮',

    'cc.bd_a1_a1':'记忆碎片',

    'cc.bd_a1_a2':'梦境',

    'cc.bd_a1_a3':'小节',

    'cc.w.ncdeer1':'因果',

    'cc.w.ncdeer2':'业报',

    'cc.bd_malist':'工程机器人',

    'cc.bd.costdrop':'心情落差',

    #技能

    'cc.m.var1':'回收利用',

    'cc.m.var2':'配合意识',

    'cc.t.snsant1':'天道酬勤·α',

    'cc.t.snsant2':'天道酬勤·β',

    'cc.m.pow1':'自动化·α',

    'cc.m.pow2':'自动化·β',

    'cc.m.pow3':'仿生海龙',

    'cc.sk.manu1':'标准化类技能',

    'cc.sk.manu2':'莱茵科技类技能',

    'cc.sk.manu3':'红松骑士团类技能',

    #设施

    'cc.t.flow_gold':'赤金生产线',

    #干员分类

    'cc.g.lgd':'龙门近卫局',

    'cc.g.lda':'鲤氏侦探事务所',

    'cc.g.ussg':'乌萨斯学生自治团',

    'cc.g.R6':'彩虹小队',

    'cc.g.sp':'异格',

    'cc.g.abyssal':'深海猎人',

    'cc.tag.op':'作业平台',

    'cc.g.psk':'红松骑士团',

    'cc.tag.knight':'骑士',

    'cc.g.karlan':'喀兰贸易',

    'cc.g.sui':'岁',

    'cc.tag.durin':'杜林族',

    'cc.gvial':'嘉维尔',

    #特殊

    'cc.c.abyssal2_1':'特殊加成',

    'cc.c.abyssal2_2':'特殊加成',

    'cc.c.abyssal2_3':'特殊叠加规则',

    'cc.t.strong2':'特殊叠加规则',

    'cc.c.room1':'部分设施',

    'cc.c.room2':'其他设施',

    'cc.c.skill':'部分技能',
}

攻击范围 = {
    '3-16': 'soox',
    '0-1': 's',
    '1-1': 'sx',
    'b-1': 'xs',
    '2-2': 'sxx',
    '1-2': 'xnsxe',
    '1-3': 'oxnsxe',
    '3-2': 'sxxx',
    '2-4': 'oxnsxxe',
    '4-1': 'sxxxx',
    'x-5': 'oxnxsxe',
    '4-5': 'oooxxnsooxxe',
    '5-1': 'sxxxxx',
    '4-6': 'oooxxnsooxxxe',
    '2-3': 'xxnsxxe',
    '2-5': 'oxxnsxxe',
    '2-6': 'ooxnoxxnsxxe',
    'x-6': 'ooxnooxnxxsxxe',
    '3-12': 'xxnsxxxe',
    '3-13': 'oxxnsxxxe',
    '4-7': 'oooxxxnsooxxxe',
    '3-6': 'xxxnsxxe',
    'x-4': 'xxxnxsxe',
    '2-1': 'xnxxnsxxe',
    '3-1': 'xxxnsxxxe',
    'y-1': 'xxxnxsxxe',
    '3-14': 'oxxxnsxxxe',
    '3-11': 'xnxxnsxxxe',
    '4-4': 'ooxxxnsoxxxe',
    '4-2': 'oxxxnsxxxxe',
    '3-3': 'xxxxnsxxxe',
    'y-2': 'xxxxnxsxxe',
    '3-18': 'xxnxxxnsxxxe',
    '3-8': 'xxxxnsxxxxe',
    'y-3': 'xxxxnxsxxxe',
    '3-5': 'xxnxxxnsxxe',
    'x-1': 'ooxnoxxxnxxsxxe',
    '唱沙': 'oooxnoooxnoooxnxxxsxxxe',
    '4-3': 'ooxxnooxxxnsoxxxe',
    'y-7': 'xxxxxnxsxxxe',
    '3-10': 'xxxxxnsxxxxe',
    'y-5': 'xxxxxnxsxxxxe',
    '3-17': 'oxxxnxxxxnsxxxe',
    'y-6': 'oxxnxxxxnxsxxe',
    '3-7': 'xnxxnxxxnsxxxe',
    '5-2': 'xxxxxxnsxxxxxe',
    '3-4': 'xxxnxxxxnsxxxe',
    '3-15': 'xxxnxxxxnsxxxe',
    '3-9': 'xxxnxxxxnsxxxxe',
    'y-4': 'xxxnxxxxnxsxxxe',
    'x-2': 'oxxxnxxxxxnxxsxxe',
    'y-8': 'xxxxnxxxxxnxsxxxe',
    'x-3': 'oooxnooxxxnoxxxxxnxxxsxxxe'
}

语音序列 = {
    '任命助理': '001',
    '交谈1': '002',
    '交谈2': '003',
    '交谈3': '004',
    '晋升后交谈1': '005',
    '晋升后交谈2': '006',
    '信赖提升后交谈1': '007',
    '信赖提升后交谈2': '008',
    '信赖提升后交谈3': '009',
    '闲置': '010',
    '干员报到': '011',
    '观看作战记录': '012',
    '精英化晋升1': '013',
    '精英化晋升2': '014',
    '编入队伍': '017',
    '任命队长': '018',
    '行动出发': '019',
    '行动开始': '020',
    '选中干员1': '021',
    '选中干员2': '022',
    '部署1': '023',
    '部署2': '024',
    '作战中1': '025',
    '作战中2': '026',
    '作战中3': '027',
    '作战中4': '028',
    '4星结束行动': '029',  # 适配老版本
    '完成高难行动': '029',
    '3星结束行动': '030',
    '非3星结束行动': '031',
    '行动失败': '032',
    '进驻设施': '033',
    '戳一下': '034',
    '信赖触摸': '036',
    '标题': '037',
    '问候': '042'
}

潜能词典 = {
    'hp': '生命上限',
    'atk': '攻击力',
    'def': '防御力',
    'res': '法术抗性',
    're_deploy': '再部署时间',
    'cost': '部署费用',
    # 'block': '阻挡数',
    'interval': '攻击速度',
}

代号 = str(input('干员代号：'))

拼音 = ''.join(_[0].capitalize() for _ in pinyin(代号, style=Style.NORMAL))

while 1:
    try:
        result0 = requests.get('https://m.prts.wiki/api.php',
                               params={
                                   'action': 'query',
                                   'prop': 'revisions',
                                   'rvprop': 'content',
                                   'titles': f'{代号}|{代号}/语音记录|后勤技能一览',
                                   'format': 'json',
                                   'formatversion': 'latest'
                               })
        break
    except Exception as e:
        print(str(e), "重新尝试获取页面...")

for _ in result0.json()['query']['pages']:
    if _['title'] == 代号:
        result1:str = _['revisions'][0]['content']
    elif _['title'] == 代号+'/语音记录':
        result2:str = _['revisions'][0]['content']
    elif _['title'] == '后勤技能一览':
        result3:str = _['revisions'][0]['content']


def r(regex, result:str=result1, flags=S) -> str:
    return ''.join(findall(regex, result, flags))


def get(keyword:str) -> str:
    return r('\|' + keyword + '=(.+?)\n')

#技能描述相关
def getSkillInfo(description:str):
    skill=int(search("(\d)",description).group(1))
    if(skill<=2):
        attrib="".join(findall(f"(?='''技能{skill}（精英{skill-1}开放）''')([\s\S]*)(?<='''技能{skill+1}（精英{skill}开放）''')", result1, flags=S))  if (findall(f"(?='''技能{skill}（精英{skill-1}开放）''')([\s\S]*)(?<='''技能{skill+1}（精英{skill}开放）''')", result1, flags=S)) else "".join(findall(f"(?='''技能{skill}（精英{skill-1}开放）''')([\s\S]*)(?<=\=\=后勤技能\=\=)", result1, flags=S))
    elif(skill==3):
        attrib="".join(findall(f"(?='''技能{skill}（精英{skill-1}开放）''')([\s\S]*)(?<=\=\=后勤技能\=\=)", result1, flags=S))
    return attrib
def getDescription(serial, level) -> str:
    return r('\|技能' + level + '描述=(.+?)\n', getSkillInfo(serial))
def getScale(serial) -> str:
    return r('\|技能范围=(.+?)\n', getSkillInfo(str(serial)))
attribTable=[[] for i in range(3)]
variable=[]
for skil in range(0,3):
    for i in range(0,10):
        if i >= 7:
            lv = "专精" + str(i-6)
        else:
            lv = str(i+1)
        attribTable[skil].append(getDescription(serial="技能" + str(skil+1), level=lv))
    while(match(".*?{{color\|#0098DC\|(.*?)}}", attribTable[skil][0])):
        for a in range(0,10):
            variable.append(search(".*?{{color\|#0098DC\|(.*?)}}", attribTable[skil][a]).group(1))
        if not variable[0]==variable[9]:
            for _ in range(0,10):
                attribTable[skil][_]=sub("(.*?){{color\|#0098DC\|.*?}}", r"\1{{明日方舟技能条|color=blue|"+"|".join(variable) + "}}", attribTable[skil][_], 1)
        else:
            for _ in range(0,10):
                attribTable[skil][_]=sub("(.*?{{color\|)#0098DC(\|.*?}})", r"\1blue\2", attribTable[skil][_], 1)
        del variable
        variable=[]
    while(match(".*?{{color\|#F49800\|(.*?)}}", attribTable[skil][0])):
        for a in range(0,10):
            variable.append(search(".*?{{color\|#F49800\|(.*?)}}", attribTable[skil][a]).group(1))
        if not variable[0]==variable[9]:
            for _ in range(0,10):
                attribTable[skil][_]=sub("(.*?){{color\|#F49800\|.*?}}", r"\1{{明日方舟技能条|color=orange|"+"|".join(variable) + "}}", attribTable[skil][_], 1)
        else:
            for _ in range(0,10):
                attribTable[skil][_]=attribTable[skil][_].replace("#F49800", "orange")
        del variable
        variable=[]
技能范围=[[],[],[]]
for i in range(3):
    技能范围[i]="<br />技能持续期间攻击范围为：{{akrange|" + 攻击范围[getScale(i+1)] + "}}" if getScale(i+1) else ""
技能描述=[attribTable[i][0]+技能范围[i] for i in range(3)]

if (r('\{\{异格干员\|原型=([^{]+?)}}')):
    异格 = '\n{{明日方舟info|异格前=' + r('\{\{异格干员\|原型=([^{]+?)}}') + '}}'
if (get('种族')) == '不明' or (get('种族')) == '未公开' or (get('种族')) == '未知':
    种族 = get('种族')
else:
    种族 = '[[明日方舟/种族#'+get('种族')+'|'+get('种族')+']]'
if (get('出身地')) == '不明' or (get('出身地')) == '未公开' or (get('出身地')) == '未知':
    出身地区 = get('出身地')
else:
    出身地区 = '[[明日方舟:'+get('出身地')+'|'+get('出身地')+']]'
if (r('{{干员异格任务\|对象干员=(.+?)[}\n\|]')):
    异格任务 = '|异格任务='+r('{{干员异格任务\|对象干员=(.+?)[}\n\|]')
if len([_ for _ in findall('\|[中英韩日]文配音=(.+?)\n', result1) if _ != '']) > 1:
    配音 = '\n|多位配音={{Cate|'
    if (get('日文配音')):
        配音 += '[['+get('日文配音')+']]' + '（日语）/ '
    if (get('中文配音')):
        配音 += '[['+get('中文配音')+']]' + '（汉语）/ '
    if (get('英文配音')):
        配音 += '[['+get('英文配音')+']]' + '（英语）/ '
    if (get('韩文配音')):
        配音 += '[['+get('韩文配音')+']]' + '（韩语）/ '
    配音 = 配音.rstrip('/ ')
    if (get('日文配音')):
        配音 += '|' + get('日文配音')
    if (get('中文配音')):
        配音 += '|' + get('中文配音')
    if (get('英文配音')):
        配音 += '|' + get('英文配音')
    if (get('韩文配音')):
        配音 += '|' + get('韩文配音')
    配音 += '}}'
else:
    配音 = '\n|配音='+get('[中英韩日]文配音')
初始范围 = 攻击范围[get('精英0范围')]
if (get('精英1范围')):
    精1范围 = 攻击范围[get('精英1范围')]
if (get('精英2范围')):
    精2范围 = 攻击范围[get('精英2范围')]
if 精2范围 == 精1范围 == 初始范围:
    精1范围 = 精2范围 = ''
elif 精2范围 == 精1范围:
    精2范围 = ''
elif 精1范围 == 初始范围:
    精1范围 = ''
if int(get('信赖加成_生命上限')):
    生命上限加成 += ' <span class="trusttext" title="信赖加成">(+' + r(
        '\|信赖加成_生命上限=(.+?)\n') + ')</span>'
if int(get('信赖加成_攻击')):
    攻击加成 += ' <span class="trusttext" title="信赖加成">(+' + r(
            '\|信赖加成_攻击=(.+?)\n') + ')</span>'
if int(get('信赖加成_防御')):
    防御加成 += ' <span class="trusttext" title="信赖加成">(+' + r(
            '\|信赖加成_防御=(.+?)\n') + ')</span>'
if (r(r"'''技能1（精英0开放）'''.+?\|技能类型1=(.+?)\n")):
    技能1触发 += '{{明日方舟标签|'+r(r"'''技能1（精英0开放）'''.+?\|技能类型1=(.+?)\n")+'}}'
if (r(r"'''技能1（精英0开放）'''.+?\|技能类型2=(.+?)\n")):
    技能1触发 += '{{明日方舟标签|'+r(r"'''技能1（精英0开放）'''.+?\|技能类型2=(.+?)\n")+'}}'
if (r(r"'''技能1（精英0开放）'''.+?\|技能1持续=(\d*?)\n\|技能2描述=")):
    技能1持续 = [_ for _ in findall(
        '\|技能专?精?\d持续=(\d*?)\n', r(r"'''技能1（精英0开放）'''.+?[='][='][后'][勤技][技能]")) if _ != '']
    if len(set(技能1持续)) == 1:
        技能1触发 += '{{明日方舟标签|持续|{{akspan|持续}}'+技能1持续[0]+'秒}}'
    else:
        技能1触发 += '{{明日方舟标签|持续|{{akspan|持续}}{{明日方舟技能条|color=white|' + \
            '|'.join(技能1持续)+'}}秒}}'
if (r(r"'''技能2（精英1开放）'''.+?\|技能类型1=(.+?)\n")):
    技能2触发 += '{{明日方舟标签|'+r(r"'''技能2（精英1开放）'''.+?\|技能类型1=(.+?)\n")+'}}'
if (r(r"'''技能2（精英1开放）'''.+?\|技能类型2=(.+?)\n")):
    技能2触发 += '{{明日方舟标签|'+r(r"'''技能2（精英1开放）'''.+?\|技能类型2=(.+?)\n")+'}}'
if (r(r"'''技能2（精英1开放）'''.+?\|技能1持续=(\d*?)\n\|技能2描述=")):
    技能2持续 = [_ for _ in findall(
        '\|技能专?精?\d持续=(\d*?)\n', r(r"'''技能2（精英1开放）'''.+?[='][='][后'][勤技][技能]")) if _ != '']
    if len(set(技能2持续)) == 1:
        技能2触发 += '{{明日方舟标签|持续|{{akspan|持续}}'+技能2持续[0]+'秒}}'
    else:
        技能2触发 += '{{明日方舟标签|持续|{{akspan|持续}}{{明日方舟技能条|color=white|' + \
            '|'.join(技能2持续)+'}}秒}}'
if (r(r"'''技能3（精英2开放）'''.+?\|技能类型1=(.+?)\n")):
    技能3触发 += '{{明日方舟标签|'+r(r"'''技能3（精英2开放）'''.+?\|技能类型1=(.+?)\n")+'}}'
if (r(r"'''技能3（精英2开放）'''.+?\|技能类型2=(.+?)\n")):
    技能3触发 += '{{明日方舟标签|'+r(r"'''技能3（精英2开放）'''.+?\|技能类型2=(.+?)\n")+'}}'
if (r(r"'''技能3（精英2开放）'''.+?\|技能1持续=(\d*?)\n\|技能2描述=")):
    技能3持续 = [_ for _ in findall(
        '\|技能专?精?\d持续=(\d*?)\n', r(r"'''技能3（精英2开放）'''.+?==后勤技能")) if _ != '']
    if len(set(技能3持续)) == 1:
        技能3触发 += '{{明日方舟标签|持续|{{akspan|持续}}'+技能3持续[0]+'秒}}'
    else:
        技能3触发 += '{{明日方舟标签|持续|{{akspan|持续}}{{明日方舟技能条|color=white|' + \
            '|'.join(技能3持续)+'}}秒}}'
if (r(r"'''技能1（精英0开放）'''.+?\|技能1初始=(\d*?)\n\|技能1消耗=")):
    技能1初始 = [_ for _ in findall(
        '\|技能专?精?\d初始=(\d*?)\n', r(r"'''技能1（精英0开放）'''.+?[='][='][后'][勤技][技能]")) if _ != '']
    if len(set(技能1初始)) == 1:
        if 技能1初始[0] != 0:
            技能1技力 += '{{akspan|初始}} {{color|blue|'+技能1初始[0]+'}} '
    else:
        技能1技力 += '{{akspan|初始}} {{明日方舟技能条|color=blue|' + \
            '|'.join(技能1初始)+'}} '
if (r(r"'''技能1（精英0开放）'''.+?\|技能1消耗=(\d*?)\n\|技能1持续=")):
    技能1消耗 = [_ for _ in findall(
        '\|技能专?精?\d消耗=(\d*?)\n', r(r"'''技能1（精英0开放）'''.+?[='][='][后'][勤技][技能]")) if _ != '']
    if len(set(技能1消耗)) == 1:
        if 技能1消耗[0] != 0:
            技能1技力 += '{{akspan|消耗}} {{color|blue|'+技能1消耗[0]+'}} '
    else:
        技能1技力 += '{{akspan|消耗}} {{明日方舟技能条|color=blue|' + \
            '|'.join(技能1消耗)+'}} '
if (r(r"'''技能2（精英1开放）'''.+?\|技能1初始=(\d*?)\n\|技能1消耗=")):
    技能2初始 = [_ for _ in findall(
        '\|技能专?精?\d初始=(\d*?)\n', r(r"'''技能2（精英1开放）'''.+?[='][='][后'][勤技][技能]")) if _ != '']
    if len(set(技能2初始)) == 1:
        if 技能2初始[0] != '0':
            技能2技力 += '{{akspan|初始}} {{color|blue|'+技能2初始[0]+'}} '
    else:
        技能2技力 += '{{akspan|初始}} {{明日方舟技能条|color=blue|' + \
            '|'.join(技能2初始)+'}} '
if (r(r"'''技能2（精英1开放）'''.+?\|技能1消耗=(\d*?)\n\|技能1持续=")):
    技能2消耗 = [_ for _ in findall(
        '\|技能专?精?\d消耗=(\d*?)\n', r(r"'''技能2（精英1开放）'''.+?[='][='][后'][勤技][技能]")) if _ != '']
    if len(set(技能2消耗)) == 1:
        if 技能2消耗[0] != '0':
            技能2技力 += '{{akspan|消耗}} {{color|blue|'+技能2消耗[0]+'}} '
    else:
        技能2技力 += '{{akspan|消耗}} {{明日方舟技能条|color=blue|' + \
            '|'.join(技能2消耗)+'}} '
if (r(r"'''技能3（精英2开放）'''.+?\|技能1初始=(\d*?)\n\|技能1消耗=")):
    技能3初始 = [_ for _ in findall(
        '\|技能专?精?\d初始=(\d*?)\n', r(r"'''技能3（精英2开放）'''.+?==后勤技能")) if _ != '']
    if len(set(技能3初始)) == 1:
        if 技能3初始[0] != '0':
            技能3技力 += '{{akspan|初始}} {{color|blue|'+技能3初始[0]+'}} '
    else:
        技能3技力 += '{{akspan|初始}} {{明日方舟技能条|color=blue|' + \
            '|'.join(技能3初始)+'}} '
if (r(r"'''技能3（精英2开放）'''.+?\|技能1消耗=(\d*?)\n\|技能1持续=")):
    技能3消耗 = [_ for _ in findall(
        '\|技能专?精?\d消耗=(\d*?)\n', r(r"'''技能3（精英2开放）'''.+?==后勤技能")) if _ != '']
    if len(set(技能3消耗)) == 1:
        if 技能3消耗[0] != '0':
            技能3技力 += '{{akspan|消耗}} {{color|blue|'+技能3消耗[0]+'}} '
    else:
        技能3技力 += '{{akspan|消耗}} {{明日方舟技能条|color=blue|' + \
            '|'.join(技能3消耗)+'}} '
天赋1 = '<span class="talentblock">' + \
    get('第一天赋1')+'</span>（精英阶段1）'+get('第一天赋1效果')
if (get('第一天赋2') and get('第一天赋2效果') != get('第一天赋1效果')):
    天赋1 += '<br /><span class="talentblock">' + \
        get('第一天赋2')+'</span>（精英阶段2）'+get('第一天赋2效果')
if (get('第二天赋2')):
    天赋2 = '<span class="talentblock">' + \
        get('第二天赋2')+'</span>（精英阶段2）'+get('第二天赋2效果')
elif (get('第二天赋1')):
    天赋2 = '<span class="talentblock">' + \
        get('第二天赋1')+'</span>（精英阶段2）'+get('第二天赋1效果')
if (get('后勤技能1-2')):
    后勤2 = '{{明日方舟标签|'+r('\|技能名='+get("后勤技能1-2")+'\n\|房间=(.+?)\n', result3) + \
        '|'+get('后勤技能1-1')+'→'+get('后勤技能1-2')+'}}（精英阶段2）' + \
        r('\|技能名='+get("后勤技能1-2")+'\n.+?\|技能描述=(.+?)\n', result3)
    if (get('后勤技能2-1')):
        后勤3 = '{{明日方舟标签|'+r('\|技能名='+get("后勤技能2-1")+'\n\|房间=(.+?)\n', result3)+'|'+r(
            '\|后勤技能2-1=(.+?)\n')+'}}（精英阶段2）'+r('\|技能名='+get("后勤技能2-1")+'\n.+?\|技能描述=(.+?)\n', result3)
else:
    后勤2 = '{{明日方舟标签|'+r('\|技能名='+get("后勤技能2-1")+'\n\|房间=(.+?)\n', result3)+'|'+r(
        '\|后勤技能2-1=(.+?)\n')+'}}（精英阶段2）'+r('\|技能名='+get("后勤技能2-1")+'\n.+?\|技能描述=(.+?)\n', result3)
后勤1图标=r('\|技能名='+get("后勤技能1-1")+'\n.+?\|技能图标=(.+?)\n', result3)+'.png' if r('\|技能名='+get("后勤技能1-1")+'\n.+?\|技能图标=(.+?)\n', result3) else ''
if(r('\|技能名='+get("后勤技能1-2")+'\n.+?\|技能图标=(.+?)\n', result3)):
    后勤2图标=r('\|技能名='+get("后勤技能1-2")+'\n.+?\|技能图标=(.+?)\n', result3)+'''.png'''
    if(r('\|技能名='+get("后勤技能2-1")+'\n.+?\|技能图标=(.+?)\n', result3)):
        后勤3图标=r('\|技能名='+get("后勤技能2-1")+'\n.+?\|技能图标=(.+?)\n', result3)+'''.png'''
else:
    后勤2图标=r('\|技能名='+get("后勤技能2-1")+'\n.+?\|技能图标=(.+?)\n', result3)+'''.png'''
for _ in range(9):
    _ = str(_+1)
    if (r('\|档案'+_+'=(.+?)\n\|档案'+_+'条件=')):
        档案 += '''
|-
| style="color:white;background:#666"|''\''''+r('\|档案'+_+'=(.+?)\n\|档案'+_+'条件=')+'''\'''
|-style="background:#f9f9f9"
|<poem>
'''+r('\|档案'+_+'文本=(.+?)\n[|}][档}]')+'''
</poem>'''
for _ in [_ for _ in findall('\|标题\d+?=(.+?)\n', result2) if _ != '']:
    语音 += '''
|-
| '''+_+'''
| ''' + r('\|标题\d+?='+_+'\n\|台词\d+?={{[Vv]oiceData/word\|中文\|(.+?)}}{{[Vv]oiceData', result2) + '''
| <sm2>'''+拼音+'''_CN_'''+语音序列[_]+'''.mp3</sm2>
| <sm2>'''+拼音+'''_zh_CN_'''+语音序列[_]+'''.mp3</sm2>'''
for _ in range(len(get('潜能类型').split(','))):
    if get('潜能').split(',')[_] == '':
        潜能 += r('\|潜能'+str(_+2)+'=(.+?)效果增强\n')+'\\'
    else:
        潜能 += 潜能词典[get('潜能类型').split(',')[_]]+'\\'
    if get('潜能').split(',')[_] == '':
        潜能 += '增强;'
    elif int(get('潜能').split(',')[_]) > 0:
        潜能 += '+'+get('潜能').split(',')[_]+';'
    else:
        潜能 += get('潜能').split(',')[_]+';'
潜能 = 潜能[:-1]

modtext=search("(\=\=模组\=\=[\S\s]*)\=\=相关道具\=\=", result1).group(1) if search("(\=\=模组\=\=[\S\s]*)\=\=相关道具\=\=", result1) else ""
material = "{{材料消耗\|([\u4e00-\u9fa5]+|RMA70-12|RMA70-24|D32钢)\|(\d+)}}"
cost = "{{材料消耗\|(龙门币)\|(\d+|\d\.\d)万}}"
branch = search("\|分支=(.*\n)", modtext).group(1) if search("\|分支=(.*\n)", modtext) else ""
info1 = search("\|分支=.*\n\|基础信息=(.*\n)", modtext).group(1) if search("\|分支=.*\n\|基础信息=(.*\n)", modtext) else ""
info1 = "<poem>\n" + sub("<br(\s?/)?>", "\n", info1).strip("\n\"") + "\n</poem>\n" if info1 else ""
name = search("\|名称=(.*\n)(?=\|类型)", modtext).group(1) if search("\|名称=(.*\n)(?=\|类型)", modtext) else ""
mtype = search("\|类型=(.*\n)", modtext).group(1) if search("\|类型=(.*\n)", modtext) else ""
info2 = search("材料消耗3=.*\n\|基础信息=(.*\n)", modtext).group(1) if search("材料消耗3=.*\n\|基础信息=(.*\n)", modtext) else ""
info2 = "<poem>\n" + sub("<br(\s?/)?>", "\n", info2).strip("\n\"") + "\n</poem>\n" if info2 else ""
task1 = search("\|任务1=(.*\n)", modtext).group(1) if search("\|任务1=(.*\n)", modtext) else ""
task2 = search("\|任务2=(.*\n)", modtext).group(1) if search("\|任务2=(.*\n)", modtext) else ""
task2 = sub("\[\[关卡一览.*?]]", "", task2)
task2 = sub("\[\[|]]", "", task2)
level = search("\|解锁等级=(\d{2})", modtext).group(1) if search("\|解锁等级=(\d{2})", modtext) else ""
time = 1
unlock = ""
while time < 7 and search("\|材料消耗=" + material + "\s?" + material + "\s?" + cost, modtext):
    unlock += search("\|材料消耗=" + material + "\s?" + material + "\s?" + cost, modtext).group(time)
    if time % 2 == 1:
        unlock += "*"
    elif time < 6:
        unlock += "+"
    else:
        unlock += "w"
    time += 1
upgrade1 = ""
upgrade2 = ""
time = 1
while time < 9 and search("\|材料消耗2=" + material + "\s?" + material + "\s?" + material + "\s?" + cost, modtext) and search("\|材料消耗3=" + material + "\s?" + material + "\s?" + material + "\s?" + cost, modtext):
    upgrade1 += search("\|材料消耗2=" + material + "\s?" + material + "\s?" + material + "\s?" + cost, modtext).group(time)
    upgrade2 += search("\|材料消耗3=" + material + "\s?" + material + "\s?" + material + "\s?" + cost, modtext).group(time)
    if time % 2 == 1:
        upgrade1 += "*"
        upgrade2 += "*"
    elif time < 8:
        upgrade1 += "+"
        upgrade2 += "+"
    else:
        upgrade1 += "w"
        upgrade2 += "w"
    time += 1
hp1 = search("\|生命=(.*)\n", modtext).group(1) if search("\|生命=(.*)\n", modtext) else ""
hp2 = search("\|生命2=(.*)\n", modtext).group(1) if search("\|生命2=(.*)\n", modtext) else ""
hp3 = search("\|生命3=(.*)\n", modtext).group(1) if search("\|生命3=(.*)\n", modtext) else ""
atk1 = search("\|攻击=(.*)\n", modtext).group(1) if search("\|攻击=(.*)\n", modtext) else ""
atk2 = search("\|攻击2=(.*)\n", modtext).group(1) if search("\|攻击2=(.*)\n", modtext) else ""
atk3 = search("\|攻击3=(.*)\n", modtext).group(1) if search("\|攻击3=(.*)\n", modtext) else ""
defence1 = search("\|防御=(.*)\n", modtext).group(1) if search("\|防御=(.*)\n", modtext) else ""
defence2 = search("\|防御2=(.*)\n", modtext).group(1) if search("\|防御2=(.*)\n", modtext) else ""
defence3 = search("\|防御3=(.*)\n", modtext).group(1) if search("\|防御3=(.*)\n", modtext) else ""
res1 = search("\|法术抗性=(.*)\n", modtext).group(1) if search("\|法术抗性=(.*)\n", modtext) else ""
res2 = search("\|法术抗性2=(.*)\n", modtext).group(1) if search("\|法术抗性2=(.*)\n", modtext) else ""
res3 = search("\|法术抗性3=(.*)\n", modtext).group(1) if search("\|法术抗性3=(.*)\n", modtext) else ""
spd1 = search("\|攻击速度=(.*)\n", modtext).group(1) if search("\|攻击速度(.*)\n", modtext) else ""
spd2 = search("\|攻击速度2=(.*)\n", modtext).group(1) if search("\|攻击速度2=(.*)\n", modtext) else ""
spd3 = search("\|攻击速度3=(.*)\n", modtext).group(1) if search("\|攻击速度3=(.*)\n", modtext) else ""
feature = search("\|特性=(.*)", modtext).group(1) if search("\|特性=(.*)", modtext) else ""
feature = sub("(<br(\s?/)?>).*", "", feature)
feature = sub("#00B0FF|#0098DC", "blue", feature)
feature = sub("#FF6237", "red", feature)
feature = sub("变动数值lite\|(up|down)\|蓝", "color|blue", feature)
talent1 = search("\|天赋2=(.*\n)", modtext).group(1) if search("\|天赋2=(.*\n)", modtext) else ""
talent1 = sub("<br(\s?/)?>※.*", "", talent1)
talent1 = sub("<br(\s?/)?>", "：", talent1)
talent1 = sub("{{.*?\|[蓝橙]\||}}", "", talent1)
talent2 = search("\|天赋3=(.*\n)", modtext).group(1) if search("\|天赋3=(.*\n)", modtext) else ""
talent2 = sub("<br(\s?/)?>※.*", "", talent2)
talent2 = sub("<br(\s?/)?>", "：", talent2)
talent2 = sub("{{.*?\|[蓝橙]\||}}", "", talent2)
mod = "".join(["""== 模组 ==\n{{明日方舟模组\n|干员名=""" , 代号 , """\n|职业分支=""" , branch , """|模组名=""" , name , """|模组类型=""" , mtype , """|证章信息=""" , info1 , """|模组信息=""" , info2 , """|模组任务-1=①：""" , task1 , """|模组任务-2=②：""" , task2 , """|解锁需求=精英阶段2 """ , level , """级，信赖值达到100%，完成该模组所有模组任务\n""" , """|解锁消耗={{#invoke:明日方舟材料|calc|""" , unlock , """}}\n""" , """|升级消耗-1={{#invoke:明日方舟材料|calc|""" , upgrade1 , """}}\n""" , """|升级消耗-2={{#invoke:明日方舟材料|calc|""" , upgrade2 , """}}\n""" , """|基础数值变化-1="""])
if hp1:
    mod += """生命""" + ' ' + """{{color|blue|+""" + hp1 + """}}<br />"""
if atk1:
    mod += """攻击""" + ' ' + """{{color|blue|+""" + atk1 + """}}<br />"""
if defence1:
    mod += """防御""" + ' ' + """{{color|blue|+""" + defence1 + """}}<br />"""
if spd1:
    mod += """攻击速度""" + ' ' + """{{color|blue|+""" + spd1 + """}}<br />"""
if res1:
    mod += """法术抗性""" + ' ' + """{{color|blue|+""" + res1 + """}}<br />"""
mod = mod.strip("<br />") + """\n|基础数值变化-2="""
if hp2:
    mod += """生命""" + ' ' + """{{color|blue|+""" + hp2 + """}}<br />"""
if atk2:
    mod += """攻击""" + ' ' + """{{color|blue|+""" + atk2 + """}}<br />"""
if defence2:
    mod += """防御""" + ' ' + """{{color|blue|+""" + defence2 + """}}<br />"""
if spd2:
    mod += """攻击速度""" + ' ' + """{{color|blue|+""" + spd2 + """}}<br />"""
if res2:
    mod += """法术抗性""" + ' ' + """{{color|blue|+""" + res2 + """}}<br />"""
mod = mod.strip("<br />") + """\n|基础数值变化-3="""
if hp3:
    mod += """生命""" + ' ' + """{{color|blue|+""" + hp3 + """}}<br />"""
if atk3:
    mod += """攻击""" + ' ' + """{{color|blue|+""" + atk3 + """}}<br />"""
if defence3:
    mod += """防御""" + ' ' + """{{color|blue|+""" + defence3 + """}}<br />"""
if spd3:
    mod += """攻击速度""" + ' ' + """{{color|blue|+""" + spd3 + """}}<br />"""
if res3:
    mod += """法术抗性""" + ' ' + """{{color|blue|+""" + res3 + """}}<br />"""
mod = mod.strip("<br />") + "\n"
mod += "|分支特性更新-1="
if search("特性追加=yes", modtext):
    mod += """特性追加：""" + feature + '\n'
else:
    mod += """特性更新：""" + feature + '\n'
mod += """|分支特性更新-2=""" + talent1 + """|分支特性更新-3=""" + talent2 + """}}"""

if search("\|模组名\=\|模组类型", mod):
    mod=""

output1 = '''{{标题格式化}}
{{明日方舟:导航}}'''+异格+'''
{{明日方舟info|'\''<big><big>'''+r('\|台词11={{[Vv]oiceData\/word\|中文\|(.+?)}}{{[Vv]oiceData', result2) + '''</big></big>'\''}}
{{明日方舟人物信息
|image=
|图片说明=
|代号='''+代号+'''<br />'''+get('干员外文名')+'''
|本名=
|别号=
|性别='''+get('性别')+'''
|发色=
|瞳色=
|身高='''+get('身高')+'''
|体重=
|三围=
|年龄=
|生日='''+get('生日')+'''
|星座=
|血型=
|种族='''+种族+'''
|职业='''+get('职业')+'''
|专精=
|画师=
|声优=
|萌点=
|出身地区='''+出身地区+'''
|活动范围='''+(get('所属组织') or get('所属国家'))+'''
|所属团体='''+get('所属团队')+'''
|个人状态=
|相关人士=
}}

''\''''+代号+'''\'''是游戏'\''《[[明日方舟]]》'\''及其衍生作品的登场角色。
== 面板 ==
{{明日方舟干员'''+异格任务+'''
|中文名='''+代号+'''
|英文名='''+get('干员外文名')+'''
|稀有度='''+str(int(get('稀有度'))+1)+'''
|画师='''+get('画师')+配音+'''
|势力='''+(get('所属组织') or get('所属国家'))+'''
|差分类型=
|差分代号=
|时装=
|职业='''+get('职业')+'''
|初始范围='''+初始范围+'''
|精1范围='''+精1范围+'''
|精2范围='''+精2范围+'''
|站位='''+get('位置')+'''
|标签='''+get('标签')+'''
|生命上限='''+get('精英0_1级_生命上限')+'/'+(get('精英2_满级_生命上限') or get('精英1_满级_生命上限'))+生命上限加成+'''
|攻击='''+get('精英0_1级_攻击')+'/'+(get('精英2_满级_攻击') or get('精英1_满级_攻击'))+攻击加成+'''
|防御='''+get('精英0_1级_防御')+'/'+(get('精英2_满级_防御') or get('精英1_满级_防御'))+防御加成+'''
|法术抗性='''+get('精英0_1级_法术抗性')+'/'+(get('精英2_满级_法术抗性') or get('精英1_满级_法术抗性'))+'''
|再部署='''+r('\|再部署=(.+?)s\n')+'''秒
|部署费用='''+r('\|部署费用=(.+?)→.+?\n')+'/'+r('\|部署费用=.+?→(.+?)\n')+'''
|阻挡数='''+get('阻挡数')+'''
|攻击速度='''+r('\|攻击速度=(.+?)s\n')+'''秒
|分支='''+r('\|职业=.+?\n\|分支=(.+?)\n')+'''
|特性='''+sub(r'{{color\|#00B0FF\|(.*?)}}',r'<span class="bluetext">\1</span>',get('特性'))+'''
|天赋1='''+sub(r'{{color\|#0098DC\|（(.*?)）}}',r' <span class="orangetext" title="潜能加成">(\1)</span> ',天赋1)+'''
|天赋2='''+sub(r'{{color\|#0098DC\|（(.*?)）}}',r' <span class="orangetext" title="潜能加成">(\1)</span> ',天赋2)+'''
|雷达图文字1='''+get('物理强度')+'''
|雷达图文字2='''+get('战场机动')+'''
|雷达图文字3='''+get('生理耐受')+'''
|雷达图文字4='''+get('战术规划')+'''
|雷达图文字5='''+get('战斗技巧')+'''
|雷达图文字6='''+get('源石技艺适应性')+'''
|潜能='''+潜能+'''
|技能1名称='''+r(r"'''技能1（精英0开放）'''.+?\|技能名=(.+?)\n")+'''
|技能1触发='''+技能1触发+'''
|技能1技力='''+技能1技力+'''
|技能1='''+技能描述[0]+'''
|技能2名称='''+r(r"'''技能2（精英1开放）'''.+?\|技能名=(.+?)\n")+'''
|技能2触发='''+技能2触发+'''
|技能2技力='''+技能2技力+'''
|技能2='''+技能描述[1]+'''
|技能3名称='''+r(r"'''技能3（精英2开放）'''.+?\|技能名=(.+?)\n")+'''
|技能3触发='''+技能3触发+'''
|技能3技力='''+技能3技力+'''
|技能3='''+技能描述[2]+'''
|后勤1图标='''+后勤1图标+'''
|后勤2图标='''+后勤2图标+'''
|后勤3图标='''+后勤3图标+'''
|后勤1={{明日方舟标签|'''+r('\|技能名='+get("后勤技能1-1")+'\n\|房间=(.+?)\n', result3)+'|'+get('后勤技能1-1')+'}}（初始）'+r('\|技能名='+get("后勤技能1-1")+'\n.+?\|技能描述=(.+?)\n', result3)+'''
|后勤2='''+后勤2+'''
|后勤3='''+后勤3+'''
}}

'''+mod+'''

== 招聘合同与信物 ==
{| class="wikitable" style="background-color:#F9F9F9;"
|-
! 招聘合同
! {{Akitem|con|'''+代号+'''|'''+str(int(get('稀有度'))+1)+'''|size=50|unit=px}}
| '''+get('干员简介')+'''<br />\'\''''+get('干员简介补充')+'''\'\'
|-
! 信物
! {{Akitem|mat|'''+代号+'''的信物|size=50|unit=px}}
| '''+get('信物用途')+'''<br />\'\''''+get('信物描述')+'''\'\'
|}

== 档案 ==
{| class="wikitable mw-collapsible mw-collapsed "
! colspan=3 style="color:white;background:#333333"|'\''人员档案'\''
|-'''+档案+'''
|}
'''
output2 = '''
== 角色台词 ==
{{Retext|N}}<!--<br />{{Zhvoice}}-->
{| class="wikitable  mw-collapsible mw-collapsed " style="background:#f9f9f9"
|-
! colspan=4 style="color:white;background:#333333"|台词列表
|-
! 场合 !! 台词 !! 日文语音 !! 中文语音'''+语音+'''
|-
|}
== 角色相关 ==
{| class="wikitable mw-collapsible mw-collapsed" style="width:450px"
|-
! style="color:white;background:#333333"|'\''新干员 — 信息录入'\''
|-
|{{Cquote|}}
{|style="float:left;width:100%;text-indent:1em;"
| 代号 ||style="background:#EDEFF2"| '''+代号+'''
|-
| 种族 ||style="background:#EDEFF2"| '''+get('种族')+'''
|-
| 出身 ||style="background:#EDEFF2"| '''+get('出身地')+'''
|-
| 专精 ||style="background:#EDEFF2"| 
|}
|-
|<poem>
</poem>
|}
{{明日方舟|干员}}
'''
#标点格式化
pattern = (r"(?<=\>)（(?![\u4e00-\u9fa5])",
           r"(?<![\u4e00-\u9fa5])）(?=\<)",
           r'(?<="trusttext")\>',
           r'(?<="orangetext")\>',
           r'(\d+|%)(\<span class\="(trust|orange)text")',
           r'(?<=[\),）]\</span>)([\u4e00-\u9fa5]|，)',
           r'(\d+|\</span\>|秒)\s?({{color\|skyblue\|)(（|\()(\+\d+|\-\d+秒)(）|\))(}})',
           r'#0098DC|#00B0FF',
           r'#F49800',
           r'#FF6237',
           r'变动数值lite\|(up|down)?\|蓝',
           r'{{[+,-,*]+?\|.*?\|([^}]*?)}}',
           r'{{akspan\|初始}}\s?{{color\|blue\|0}}\s?|{{fa\|.*?}}|{{±\|.*?\|.*?}}',
           r'{{修正\|([^|]*?)\|name=修正\d}}',   #aktypo
           r'{{修正\|(.*?)\|原文=(.*?)\|原因=\d\|name=修正\d}}',
           r'{{修正\|(.*?)\|原文=(.*?)\|name=修正\d\|原因=\d\|group=.*?}}'
           )
string = (r"(",
          r")",
          r' title="信赖加成">',
          r' title="潜能加成">',
          r'\1 \2',
          r' \1',
          r'\1 <span class="bluetext" title="模组加成">(\4)</span>',
          r'blue',
          r'orange',
          r'red',
          r'color|blue',
          r'\1',
          r'',
          r'{{aktypo|\1}}',
          r'\2{{aktypo|\1}}',
          r'\2{{aktypo|\1}}',
          )
key = 0
while key < len(pattern):
    output1 = sub(pattern[key], string[key], output1)
    key += 1

#添加术语释义
for _ in 术语字典:
    term=术语字典[_]
    output1 = sub(r"{{术语\|"+_.replace(".", "\.")+r"\|({{color\|(blue|orange)\|"+术语字典[_]+"}}|"+术语字典[_]+")}}", r'<span style="border-bottom:1px solid;">\1</span><ref name="'+术语字典[_]+'">'+术语释义["{{术语|"+_+"|"+术语字典[_]+"}}"]+'</ref>',output1,1)
    #output1 = output1.replace(_, f'<span style="border-bottom:1px solid;">{term}</span><ref name="{term}">' + 术语释义[_] + '</ref>', 1)
    output1 = sub(r"{{术语\|"+_.replace(".", "\.")+r"\|({{color\|(blue|orange)\|"+术语字典[_]+"}}|"+术语字典[_]+")}}", r'<span style="border-bottom:1px solid;">\1</span><ref name="'+术语字典[_]+'" />',output1)

open(f".{sep}{代号}.wikitext", "w", encoding="utf-8").write(output1+output2)

print("已生成"+代号+".wikitext")
