#NEW: what needs to be done is compare frequency in the html file to decide the website's type, then we append the title, description, link and type into the existing learningResources.json
import json
import sys
import os.path

if not os.path.exists('tmp/discoveredLinks.json'):
    f = open('tmp/discoveredLinks.json', "w")
    json.dump([], f)
    f.close()

if not os.path.exists('tmp/blockedLinks.json'):
    f = open('tmp/blockedLinks.json', "w")
    json.dump([], f)
    f.close()

with open('tmp/discoveredLinks.json', 'r+', encoding='utf8') as file:
    data = json.load(file)
    newLinks = json.loads(sys.argv[1])
    bl = open('tmp/blockedLinks.json', "r+", encoding='utf8')
    blData = json.load(bl)
    # newLinks = sys.argv[1].split(",")
    file.seek(0)
    for link in newLinks:
        if not link in blData:
            if not link in data:
                data.append(link)
    file.truncate(0)
    json.dump(data, file)
    file.close()
