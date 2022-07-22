import requests
import json
import urllib

urlTitleList = []
urlList = []
title = ''

titles = urllib.parse.quote(
    'File:立绘_安德切尔_skin1.png|File:头像_安德切尔_skin1.png|File:半身像_安德切尔_skin1.png')

while 1:
    try:
        result0 = requests.get('https://m.prts.wiki/api.php?'
                               'action=query&'
                               'prop=imageinfo&'
                               'titles=' + titles + '&'
                               'iiprop=url&'
                               'format=json&'
                               'formatversion=latest')
        break
    except Exception as e:
        print(str(e), "重试...")
result = json.loads(result0.text)['query']['pages']

for _ in range(len(result)):
	title = result[_]['title'][3:]
	if title[:3] == '半身像' or title[:2] == '立绘' or title[:2] == '地图' or title[:2] == '技能' or title[:5] == '道具 带框' or title[:2] == '模组' or title[:2] == '图标':
		title = '明日方舟' + title
	elif title[:2] == '道具' or title[:2] == '主题' and title[-6:-4] == '总览':
		title = '明日方舟', title
	elif title[:4] == '模组类型':
		title='AkModuleType',title[4:]
	elif title[:2] == '头像':
		title = '明日方舟 tx' + title[2:]
	print(f'【{_ + 1}/{len(result)}】\t{title}\t下载中...')
	open('/Users/emmm/Desktop/明日方舟/图片/'+title, "wb").write(
	    requests.get(result[_]['imageinfo'][0]['url']).content)
	print('\t下载完成')
