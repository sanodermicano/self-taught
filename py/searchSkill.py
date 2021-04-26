#NEW: what needs to be done is compare frequency in the html file to decide the website's type, then we append the title, description, link and type into the existing learningResources.json
import json
import sys
import random
#make it less hard-coded

def removeDuplicates(it):
    seen = []
    for x in it:
        if x not in seen:
            yield x
            seen.append(x)
#for now shuffle is used
#make resources into an array of arrays and each array contains LRs related only to each skill
with open('tmp/learningResources.json', 'r', encoding='utf8') as file:
    data = json.load(file)
    # newResources = ["Photoshop", "C#"]
    # newResources = ["Photoshop"]
    newResources = sys.argv[1].split(",")
    # print(newResources)
    resources = []
    for dataElement in data:
        for newResource in newResources:
            # print(newResource)
            if 'title' in dataElement:
                if newResource.lower() in dataElement['title'].lower():
                    resources.append(dataElement)
            #         continue
            # if 'description' in dataElement:
            #     if newResource.lower() in dataElement['description'].lower():
            #         resources.append(dataElement)

    resources = list(removeDuplicates(resources))
    random.shuffle(resources)
    print(json.dumps(resources))
    file.close()
