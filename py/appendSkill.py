import json
import sys
import os.path

if not os.path.exists('tmp/rawData.json'):
    f = open('tmp/learningResources.json', "w")
    json.dump([], f)
    f.close()
#check if what's being added is in the list or nah & connect buildtree with cleaningskilltree
with open('tmp/rawData.json', 'r+', encoding='utf8') as file:
    data = json.load(file)
    resource = json.loads(sys.argv[1])
    # resource = {'parent':'Fingerstyle Guitar For Beginners | STEP BY STEP Course | Udemy', 'children':['Learn To Play Fingerstyle Guitar and Percussive Fingerstyle In A Simple Proven Way! You will play 20 awesome songs']}
    # resource = {'parent':'Microsoft 365 Admin Tips and Tricks | Udemy', 'children':['Some knowledge of Microsoft 365 Admin is suggested']}
    if resource not in data:
        # print("not in rawData")
        file.seek(0)
        data.append(resource)
        file.truncate(0)
        json.dump(data, file)
    # else:
    #     print("in rawData")
    file.close()
