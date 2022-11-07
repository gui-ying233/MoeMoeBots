from os import sep
from re import S, findall, sub, search

import requests
from pypinyin import Style, pinyin

output1 = output2 = 异格 = 种族 = 出身地区 = 异格任务 = 配音 = 初始范围 = 精1范围 = 精2范围 = 生命上限加成 = 攻击加成 = 防御加成 = 潜能 = 技能1触发 = 技能2触发 = 技能3触发 = 技能1持续 = 技能2持续 = 技能3持续 = 技能1初始 = 技能2初始 = 技能3初始 = 技能1技力 = 技能2技力 = 技能3技力 = 天赋1 = 天赋2 = 后勤2 = 后勤3 = mod = 档案 = 语音 = ''

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
        result0: requests.models.Response = requests.get('https://m.prts.wiki/api.php',
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
        result1: str = _['revisions'][0]['content']
    elif _['title'] == 代号+'/语音记录':
        result2: str = _['revisions'][0]['content']
    elif _['title'] == '后勤技能一览':
        result3: str = _['revisions'][0]['content']


def r(regex, result: str = result1, flags=S) -> str:
    return ''.join(findall(regex, result, flags))


def get(keyword: str) -> str:
    return r('\|' + keyword + '=(.+?)\n')


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
    配音 = '\n|多位配音='
    if (get('日文配音')):
        配音 += '[['+get('日文配音')+']]' + \
            '[[CAT:'+get('日文配音')+']]（日语）/ '
    if (get('中文配音')):
        配音 += '[['+get('中文配音')+']]' + \
            '[[CAT:'+get('中文配音')+']]（汉语）/ '
    if (get('英文配音')):
        配音 += '[['+get('英文配音')+']]' + \
            '[[CAT:'+get('英文配音')+']]（英语）/ '
    if (get('韩文配音')):
        配音 += '[['+get('韩文配音')+']]' + \
            '[[CAT:'+get('韩文配音')+']]（韩语）/ '
    配音 = 配音[:-2]
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

#模组正则
if search("(\=\=模组\=\=[\S\s]*)\=\=相关道具\=\=", result1):
    modtext=search("(\=\=模组\=\=[\S\s]*)\=\=相关道具\=\=", result1).group(1)
    material = "{{材料消耗\|([\u4e00-\u9fa5]+|RMA70-12|RMA70-24|D32钢)\|(\d+)}}"
    cost = "{{材料消耗\|(龙门币)\|(\d+|\d\.\d)万}}"
    branch = search("\|分支=(.*\n)", modtext).group(1) if search("\|分支=(.*\n)", modtext) else ""
    info1 = search("\|分支=.*\n\|基础信息=(.*\n)", modtext).group(1) if search("\|分支=.*\n\|基础信息=(.*\n)", modtext) else ""
    info1 = "<poem>\n" + sub("<br>|<br/>|<br\s/>", "\n", info1).strip("\n\"") + "\n</poem>\n" if info1 else ""
    name = search("\|名称=(.*\n)(?=\|类型)", modtext).group(1) if search("\|名称=(.*\n)(?=\|类型)", modtext) else ""
    mtype = search("\|类型=(.*\n)", modtext).group(1) if search("\|类型=(.*\n)", modtext) else ""
    info2 = search("材料消耗3=.*\n\|基础信息=(.*\n)", modtext).group(1) if search("材料消耗3=.*\n\|基础信息=(.*\n)", modtext) else ""
    info2 = "<poem>\n" + sub("<br>|<br/>|<br\s/>", "\n", info2).strip("\n\"") + "\n</poem>\n" if info2 else ""
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
    feature = sub("(<br>|<br/>|<br\s/>).*", "", feature)
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
    mod = "".join(["""\n== 模组 ==\n{{明日方舟模组\n|干员名=""" , 代号 , """\n|职业分支=""" , branch , """|模组名=""" , name , """|模组类型=""" , mtype , """|证章信息=""" , info1 , """|模组信息=""" , info2 , """|模组任务-1=①：""" , task1 , """|模组任务-2=②：""" , task2 , """|解锁需求=精英阶段2 """ , level , """级，信赖值达到100%，完成该模组所有模组任务\n""" , """|解锁消耗={{#invoke:明日方舟材料|calc|""" , unlock , """}}\n""" , """|升级消耗-1={{#invoke:明日方舟材料|calc|""" , upgrade1 , """}}\n""" , """|升级消耗-2={{#invoke:明日方舟材料|calc|""" , upgrade2 , """}}\n""" , """|基础数值变化-1="""])
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
    mod += """|分支特性更新-2=""" + talent1 + """|分支特性更新-3=""" + talent2 + """}}\n"""

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
|特性='''+get('特性')+'''
|天赋1='''+天赋1+'''
|天赋2='''+天赋2+'''
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
|技能1='''+r(r"'''技能1（精英0开放）'''.+?\|技能1描述=(.*?)\n\|技能1初始=")+'''
|技能2名称='''+r(r"'''技能2（精英1开放）'''.+?\|技能名=(.+?)\n")+'''
|技能2触发='''+技能2触发+'''
|技能2技力='''+技能2技力+'''
|技能2='''+r(r"'''技能2（精英1开放）'''.+?\|技能1描述=(.*?)\n\|技能1初始=")+'''
|技能3名称='''+r(r"'''技能3（精英2开放）'''.+?\|技能名=(.+?)\n")+'''
|技能3触发='''+技能3触发+'''
|技能3技力='''+技能3技力+'''
|技能3='''+r(r"'''技能3（精英2开放）'''.+?\|技能1描述=(.*?)\n\|技能1初始=")+'''
|后勤1图标='''+r('\|技能名='+get("后勤技能1-1")+'\n.+?\|技能图标=(.+?)\n', result3)+'''.png
|后勤2图标='''+r('\|技能名='+get("后勤技能1-2")+'\n.+?\|技能图标=(.+?)\n', result3)+'''.png
|后勤3图标='''+r('\|技能名='+get("后勤技能2-1")+'\n.+?\|技能图标=(.+?)\n', result3)+'''.png
|后勤1={{明日方舟标签|'''+r('\|技能名='+get("后勤技能1-1")+'\n\|房间=(.+?)\n', result3)+'|'+get('后勤技能1-1')+'}}（初始）'+r('\|技能名='+get("后勤技能1-1")+'\n.+?\|技能描述=(.+?)\n', result3)+'''
|后勤2='''+后勤2+'''
|后勤3='''+后勤3+'''
}}
'''+mod+'''
== 招聘合同与信物 ==
{| class="wikitable" style="background-color:#F9F9F9;"
|-
! 招聘合同
! {{Akitem|con|'''+代号+'''|6|size=50|unit=px}}
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

open(f".{sep}{代号}.wikitext", "w", encoding="utf-8").write(output1+output2)

print('已生成。')
