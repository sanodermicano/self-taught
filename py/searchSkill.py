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
    # newResources = sys.argv[1].split(",")

    # newResources = json.loads(sys.argv[1])
    # rawData = json.loads('{"skills": ["Unity", "Java"], "ranges": ["-1", "1"]}')
    # rawData = json.loads('{"skills": "PHP", "ranges": "4", "lrtype": "Questions & Answers"}')
    rawData = json.loads(sys.argv[1])
    newResources = None
    nrLen = 0
    if isinstance(rawData['skills'], str):
        newResources = {"skills": [rawData['skills']], "ranges": [rawData['ranges']], "lrtype": [rawData['lrtype']]}
        nrLen = 1
    else:
        newResources = rawData
        nrLen = len(newResources['skills'])
    
    lrtype = newResources['lrtype']
    # {'skills': 'Unity', 'ranges': '1'}
    # {'skills': ['Unity', 'C#'], 'ranges': ['1', '1']}

    print(nrLen)
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
                    
            #         continue
            # if 'description' in dataElement:
            #     if newResources.lower() in dataElement['description'].lower():
            #         resources.append(dataElement)

    resources = list(removeDuplicates(resources))
    random.shuffle(resources)
    print(json.dumps(resources))
    file.close()
