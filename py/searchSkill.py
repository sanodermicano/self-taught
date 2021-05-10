import json
import sys
import random
import os
import pymongo
from dotenv import load_dotenv
from bson import json_util

dotenv_path = './.env' #init .env
load_dotenv(dotenv_path)

class Searchskill:
    def removeDuplicates(self, it):
        seen = []
        for x in it:
            if x not in seen:
                yield x
                seen.append(x)

    def contentBasedFiltering(self):
        #for now shuffle is used
        #make resources into an array of arrays and each array contains LRs related only to each skill
        # rawData = json.loads('{"skills": ["Unity", "Java"], "ranges": ["-1", "1"], "lrtype": "Questions & Answers"}')
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


        mongoClient = pymongo.MongoClient(os.environ.get("MONGO_CONNECTION_STRING"))
        mongoDb = mongoClient.get_database('self-taught-lr')

        data = list(mongoDb['learning-resources'].find({}, {'_id': False}))
        resources = []
        for dataElement in data:
            if 'title' in dataElement:
                for i in range(0, nrLen):
                    if int(newResources['ranges'][i]) > -1 and newResources['skills'][i] != "-1":
                        if newResources['ranges'][i] == '1' or newResources['ranges'][i] == '2':
                            if newResources['skills'][i].lower() in dataElement['title'].lower() and dataElement['difficulty'] == "Beginner" and (dataElement['type'] == lrtype or lrtype == "Any"):
                                resources.append(json_util.loads(json_util.dumps(dataElement)))
                        elif newResources['ranges'][i] == '3':
                            if newResources['skills'][i].lower() in dataElement['title'].lower() and dataElement['difficulty'] == "Intermediate" and (dataElement['type'] == lrtype or lrtype == "Any"):
                                resources.append(json_util.loads(json_util.dumps(dataElement)))
                        elif newResources['ranges'][i] == '4' or newResources['ranges'][i] == '5':
                            if newResources['skills'][i].lower() in dataElement['title'].lower() and dataElement['difficulty'] == "Advanced" and (dataElement['type'] == lrtype or lrtype == "Any"):
                                resources.append(json_util.loads(json_util.dumps(dataElement)))
                        
        resources = list(self.removeDuplicates(resources))
        random.shuffle(resources)
        print(json.dumps(resources))
    
searchskill = Searchskill()
searchskill.contentBasedFiltering()