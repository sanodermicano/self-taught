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
nrLen = 0

if isinstance(rawData['skills'], str):
        newResources = {"skills": [rawData['skills']], "ranges": [rawData['ranges']], "id": [rawData['id']], "lrtype": [rawData['lrtype']]}
        nrLen = 1
else:
    newResources = rawData
    nrLen = len(newResources['skills'])
userId = rawData['id']
lrtype = newResources['lrtype']
# alreadyVisited = ['alreadyVisited']

# with open('tmp/users/rec1.json', 'r', encoding='utf8') as file:
with open('tmp/users/rec'+str(userId)+'.json', 'r', encoding='utf8') as file:
    data = json.load(file)
    resources = []
    for dataElement in data:
        if 'title' in dataElement:
            for i in range(0, nrLen):
                if int(newResources['ranges'][i]) > -1 and newResources['skills'][i] != "-1":
                    if newResources['ranges'][i] == '1' or newResources['ranges'][i] == '2':
                        if newResources['skills'][i].lower() in dataElement['title'].lower() and dataElement['difficulty'] == "Beginner" and (dataElement['type'] == lrtype or lrtype == "Any"):
                            resources.append(dataElement)
                    elif newResources['ranges'][i] == '3':
                        if newResources['skills'][i].lower() in dataElement['title'].lower() and dataElement['difficulty'] == "Intermediate" and (dataElement['type'] == lrtype or lrtype == "Any"):
                            resources.append(dataElement)
                    elif newResources['ranges'][i] == '4' or newResources['ranges'][i] == '5':
                        if newResources['skills'][i].lower() in dataElement['title'].lower() and dataElement['difficulty'] == "Advanced" and (dataElement['type'] == lrtype or lrtype == "Any"):
                            resources.append(dataElement)

    resources = list(removeDuplicates(resources))
    file.close()
    print(json.dumps(resources))