import json
import sys
import os
import pymongo
from dotenv import load_dotenv
import dns

dotenv_path = './.env' #init .env
load_dotenv(dotenv_path)

class ConcludedSkill:
    def removeDuplicates(self, it):
        seen = []
        for x in it:
            if x not in seen:
                yield x
                seen.append(x)
    
    def conclude(self):
        mongoClient = pymongo.MongoClient(os.environ.get("MONGO_CONNECTION_STRING"))
        mongoDb = mongoClient.get_database('self-taught-stb').skills

        # print(mongoDb.find_one()['skills'])
        data = mongoDb.find_one()['skills']

        newResources = sys.argv[1].split(",")
        concludedSkills = []
        for dataElement in data:
            for newResource in newResources:
                if dataElement.lower() in newResource.lower().split():
                    concludedSkills.append(dataElement)
                if (" " + dataElement.lower() + " ") in newResource.lower():
                    concludedSkills.append(dataElement)

        concludedSkills = list(self.removeDuplicates(concludedSkills))
        concludedSkills = concludedSkills[::-1] #reverse array
        if len(concludedSkills) > 16:
            concludedSkills = concludedSkills[:16]
        print(json.dumps(concludedSkills))

concludedSkill = ConcludedSkill()
concludedSkill.conclude()