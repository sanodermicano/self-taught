import json
import sys

def removeDuplicates(it):
    seen = []
    for x in it:
        if x not in seen:
            yield x
            seen.append(x)

with open('tmp/skills.json', 'r', encoding='utf8') as file:
    data = json.load(file)
    newResources = sys.argv[1].split(",")
    # print(newResources)
    concludedSkills = []
    for dataElement in data:
        for newResource in newResources:
            if dataElement.lower() in newResource.lower().split():
                concludedSkills.append(dataElement)
            if (" " + dataElement.lower() + " ") in newResource.lower():
                concludedSkills.append(dataElement)

    concludedSkills = list(removeDuplicates(concludedSkills))
    concludedSkills = concludedSkills[::-1] #reverse array
    if len(concludedSkills) > 16:
        concludedSkills = concludedSkills[:16]
    print(json.dumps(concludedSkills))
    file.close()
