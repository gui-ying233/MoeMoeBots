from hashlib import sha1

import requests

urlTitleList = []
urlList = []
titles = []
title = ''


def 新干员(new: str) -> list[str]:
    global titles
    for _ in new.split('|'):
        titles += ['头像_'+_, '头像_'+_+'_2', '半身像_'+_+'_1',
                   '半身像_'+_+'_2', '立绘_'+_+'_1', '立绘_'+_+'_2']
    return titles


def 新时装(new: str, id: int = 1) -> list[str]:
    global titles
    id = str(id)
    for _ in new.split('|'):
        titles += ['头像_'+_+'_skin'+id, '半身像_' +
                   _+'_skin'+id, '立绘_'+_+'_skin'+id+'']
    return titles


新时装('爱丽丝|老鲤|风丸')

新干员('白铁|达格达|明椒|铅踝')

titles += '头像_敌人_特雷西斯.png'.split('|')

for _ in range(len(titles)):
    if titles[_][:3] != '文件:' and titles[_][:5] != 'File:':
        titles[_] = '文件:' + titles[_]
    if titles[_][-4:] != '.png':
        titles[_] += '.png'
while 1:
    try:
        result0 = requests.get('https://m.prts.wiki/api.php',
                               params={
                                   'action': 'query',
                                   'prop': 'imageinfo',
                                   'titles': '|'.join(titles),
                                   'iiprop': 'url|sha1',
                                   'format': 'json',
                                   'formatversion': 'latest'
                               })
        break
    except Exception as e:
        print(str(e), "重试...")
result = result0.json()['query']['pages']

for _ in range(len(result)):
    title = result[_]['title'][3:]
    try:
        if result[_]['missing']:
            print(f'【{_ + 1}/{len(result)}】\t{title}\t未找到文件')
    except:
        if title[:4] == '模组类型':
            title = 'AkModuleType' + title[4:]
        elif title[:3] == '半身像' or title[:2] == '立绘' or title[:2] == '地图' or title[:2] == '技能' or title[:5] == '道具 带框' or title[:2] == '模组' or title[:2] == '图标':
            title = '明日方舟' + title
        elif title[:2] == '道具' or title[:2] == '主题' and title[-6:-4] == '总览':
            title = '明日方舟 ' + title
        elif title[:2] == '头像':
            title = '明日方舟 tx' + title[2:]
        elif title[:5] == '情报处理室':
            title = '明日方舟剧情 ' + title[6:]
        elif title[:6] == '职业分支图标':
            title = '明日方舟职业_分支' + title[6:]
        elif title[:9] == 'Skin logo':
            title = 'Skinlogo' + title[9:]
        elif title[:3] == '主题图':
            title = title[4:]
        try:
            while 1:
                print(f'【{_ + 1}/{len(result)}】\t{title}\t下载中…')
                open('/Users/emmm/Desktop/明日方舟/图片/'+title, "wb").write(
                    requests.get(result[_]['imageinfo'][0]['url']).content)
                if result[_]['imageinfo'][0]['sha1'] == sha1(open('/Users/emmm/Desktop/明日方舟/图片/'+title, "rb").read()).hexdigest():
                    print('\t下载完成')
                    break
                else:
                    print("SHA-1验证失败，重新下载…")
        except Exception as e:
            print(str(e), "下载失败")
print('进程结束')
