import json
import sys
import random

def removeDuplicates(it):
    seen = []
    for x in it:
        if x not in seen:
            yield x
            seen.append(x)

# print(json.dumps(sys.argv[1]))
# sys.exit()

# {"skills":["HTML","React","Java"],"id":1}

rawData = json.loads(sys.argv[1])
newResources = None
if isinstance(rawData['skills'], str):
    newResources = rawData['skills'].split(",")
else:
    newResources = rawData['skills']
userId = rawData['id']
# alreadyVisited = ['alreadyVisited']

# with open('tmp/users/rec1.json', 'r', encoding='utf8') as file:
with open('tmp/users/rec'+str(userId)+'.json', 'r', encoding='utf8') as file:
    data = json.load(file)
    resources = []
    for dataElement in data:
        if 'title' in dataElement:
            if any(newResource.lower() in dataElement['title'].lower() for newResource in newResources):
                resources.append(dataElement)

    resources = list(removeDuplicates(resources))
    file.close()
    print(json.dumps(resources))