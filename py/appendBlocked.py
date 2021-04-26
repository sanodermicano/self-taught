import json
import sys
import os.path
#can be turned into one file with appendLink
if not os.path.exists('tmp/blockedLinks.json'):
    f = open('tmp/blockedLinks.json', "w")
    json.dump([], f)
    f.close()

with open('tmp/blockedLinks.json', 'r+', encoding='utf8') as file:
    data = json.load(file)
    newLinks = json.loads(sys.argv[1])
    file.seek(0)
    for link in newLinks:
        if not link in data:
            data.append(link)
    file.truncate(0)
    json.dump(data, file)
    file.close()