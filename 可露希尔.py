import requests
import json
import urllib

urlTitleList = []
urlList = []

titles = urllib.parse.quote(
	'File:立绘_安德切尔_skin1.png|File:头像_安德切尔_skin1.png|File:半身像_安德切尔_skin1.png')

result0 = requests.get('https://m.prts.wiki/api.php?'
					   'action=query&'
					   'prop=imageinfo&'
					   'titles=' + titles + '&'
					   'iiprop=url&'
					   'format=json&'
					   'formatversion=latest')
result = json.loads(result0.text)['query']['pages']
for _ in range(len(result)):
	print(f'【{_ + 1}/{len(result)}】\t{result[_]["title"]}\tDownload...')
	open('/Users/emmm/Desktop/明日方舟/图片/'+result[_]['title'][3:], "wb").write(
		requests.get(result[_]['imageinfo'][0]['url']).content)
	print('\tDone')