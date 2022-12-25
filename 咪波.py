from hashlib import sha1
from os import mkdir
from shutil import rmtree

import requests

titles = []


def 新干员(new: str) -> list[str]:
    global titles
    for _ in new.split('|'):
        titles += [
            '头像_' + _, '头像_' + _ + '_2', '半身像_' + _ + '_1', '半身像_' + _ + '_2',
            '立绘_' + _ + '_1', '立绘_' + _ + '_2', '道具_带框_' + _ + '的信物'
        ]
    return titles


def 新时装(new: str, id: int = 1) -> list[str]:
    global titles
    id = str(id)
    for _ in new.split('|'):
        titles += [
            '头像_' + _ + '_skin' + id, '半身像_' + _ + '_skin' + id,
            '立绘_' + _ + '_skin' + id + ''
        ]
    return titles


def 新技能(new: str) -> list[str]:
    global titles
    for _ in new.split('|'):
        titles.append('技能_' + _)
    return titles


def 新关卡(new: str) -> list[str]:
    global titles
    while 1:
        try:
            result1 = requests.get('https://mzh.moegirl.org.cn/api.php',
                                   params={
                                       "action": "query",
                                       "format": "json",
                                       "titles": new,
                                       "generator": "images",
                                       "utf8": 1,
                                       "formatversion": 2,
                                       "gimlimit": "max"
                                   })
            break
        except Exception as e:
            print(str(e), "重试...")
    result = result1.json()['query']['pages']
    for _ in result:
        if _["missing"]:
            try:
                if _["known"]:
                    pass
            except:
                if _["title"][10:12] == "tx" and _["title"][13:15] == "敌人":
                    titles.append("File:头像 敌人" + _["title"][15:])
                elif _["title"][-6:-4] == "地图":
                    titles.append(_["title"])
                else:
                    print("非预期图片：" + _["title"])
    return titles


def 清除() -> None:
    rmtree('./图片/')
    mkdir('./图片')


def main() -> None:
    global titles
    title = ''
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
            elif title[:
                       3] == '半身像' or title[:
                                            2] == '立绘' or title[:
                                                                2] == '地图' or title[:
                                                                                    2] == '技能' or title[:
                                                                                                        5] == '道具 带框' or title[:
                                                                                                                               2] == '模组' or title[:
                                                                                                                                                   2] == '图标':
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
                    open('./图片/' + title,
                         "wb").write(requests.get(result[_]['imageinfo'][0]['url']).content)
                    if result[_]['imageinfo'][0]['sha1'] == sha1(
                            open('./图片/' + title, "rb").read()).hexdigest():
                        print('\t下载完成')
                        break
                    else:
                        print("SHA-1验证失败，重新下载…")
            except Exception as e:
                print(str(e), "下载失败")
    print('进程结束')


# 清除()
# 新时装('')
# 新干员('')
# 新技能('')
新关卡("明日方舟/照我以火/活动关卡")
# titles += ''.split('|')
main()
