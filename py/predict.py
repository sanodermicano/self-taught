import json
import sys
import re


def removeDuplicatesReverse(arr):
    seen = set()
    seen_add = seen.add
    return [x for x in arr[::-1] if not (x in seen or seen_add(x))][::-1]


#expected input is a skill from skill.json
skillsFile = open('tmp/skills.json', encoding="utf8")
skills = json.load(skillsFile)

with open('tmp/skillTree.json', encoding="utf8") as json_file:
    data = json.load(json_file)
    skill = sys.argv[1]
    if len(skill) <= 2:
        skill = ' ' + skill + ' '
    nextSkills = []
    i = 0
    for dataElement in data:
        for j in range(0, len(dataElement['children'])):
            if skill.lower() in dataElement['children'][j].lower():
                if skill.lower() not in dataElement['parent'].lower() and dataElement['parent'] not in nextSkills:
                    nextSkills.append(dataElement['parent'])
                    i+=1

    skillsPrediction = []
    for s in skills:
        for ns in nextSkills:
            if s in ns:
                skillsPrediction.append(s)

    skillsPrediction = removeDuplicatesReverse(skillsPrediction)
    skillsPrediction = skillsPrediction[::-1] #reverse array
    if len(skillsPrediction) > 16:
        skillsPrediction = skillsPrediction[:16]
    print(json.dumps(skillsPrediction))
    json_file.close()