import requests
from json import load, dumps
from datetime import datetime
from time import sleep
from subprocess import call

while True:
    print(str(datetime.now())[:-7])

    noChange = True
    dataNew = {}

    with open("/Users/emmm/Desktop/明日方舟/讨论监视.json", "r") as f:
        dataOld = load(f)

    while 1:
        try:
            result0 = requests.get("https://mzh.moegirl.org.cn/api.php",
                                   params={
                                       "action": "query",
                                       "format": "json",
                                       "prop": "revisions",
                                       "titles": "明日方舟",
                                       "generator": "prefixsearch",
                                       "utf8": "1",
                                       "formatversion": "latest",
                                       "rvprop": "timestamp|ids",
                                       "gpssearch": "明日方舟",
                                       "gpsnamespace": "1|5|11|13|9|15|275|829",
                                       "gpslimit": "max",
                                       "format": "json",
                                       "formatversion": "latest"
                                   })
            break
        except Exception as e:
            print(str(e), "重试...")
    result = result0.json()["query"]["pages"]
    for _ in range(len(result)):
        dataNew.update({result[_]["title"]: int(result[_]["revisions"][0]["timestamp"][:4] + result[_]["revisions"][0]["timestamp"][5:7] + result[_]["revisions"][0]
                                                ["timestamp"][8:10] + result[_]["revisions"][0]["timestamp"][11:13] + result[_]["revisions"][0]["timestamp"][14:16] + result[_]["revisions"][0]["timestamp"][17:19])})
    open("/Users/emmm/Desktop/明日方舟/讨论监视.json",
         "w").write(dumps(dataNew, indent=4, ensure_ascii=False))

    for k, v in dataNew.items():
        if k not in dataOld:
            noChange = False
            print('新讨论页：', k)
            cmd = 'display notification \"' + k + '\" with title \"新讨论页\"'
            call(["osascript", "-e", cmd])
        elif v > dataOld[k]:
            noChange = False
            print('有新讨论更改：', k)
            cmd = 'display notification \"' + k + '\" with title \"有新讨论更改\"'
            call(["osascript", "-e", cmd])
    if noChange:
        print('无新讨论更改')

    sleep(3600)
