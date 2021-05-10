import json
import sys
import re
import os
import pymongo
from dotenv import load_dotenv

dotenv_path = './.env' #init .env
load_dotenv(dotenv_path)

class Predict:
    def removeDuplicatesReverse(self, arr):
        seen = set()
        seen_add = seen.add
        return [x for x in arr[::-1] if not (x in seen or seen_add(x))][::-1]

    def whatDoILearnNext(self):
        mongoClient = pymongo.MongoClient(os.environ.get("MONGO_CONNECTION_STRING"))
        mongoDb = mongoClient.get_database('self-taught-stb')
        skills = mongoDb['skills'].find_one()['skills']
        data = mongoDb['skilltree'].find()

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

        skillsPrediction = self.removeDuplicatesReverse(skillsPrediction)
        skillsPrediction = skillsPrediction[::-1] #reverse array
        if len(skillsPrediction) > 16:
            skillsPrediction = skillsPrediction[:16]
        print(json.dumps(skillsPrediction))
    
predict = Predict()
predict.whatDoILearnNext()