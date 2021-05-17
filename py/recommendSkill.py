import json
import sys
import random
import os
import pymongo
from dotenv import load_dotenv
from bson import json_util
import re
import dns

# https://stackoverflow.com/questions/41546883/what-is-the-use-of-python-dotenv
dotenv_path = './.env' #init .env
load_dotenv(dotenv_path)

class RecommendSkill:
    def removeDuplicates(self, it):
        seen = []
        for x in it:
            if x not in seen:
                yield x
                seen.append(x)
    
    def contentAndCollaborativeBasedFiltering(self):
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


        mongoClient = pymongo.MongoClient(os.environ.get("MONGO_CONNECTION_STRING"))
        mongoDbRec = mongoClient.get_database('self-taught-recommender')

        lrSortings = list(mongoDbRec["priority"].find_one()['rec'+str(userId)]) #retreive the data more efficiently

        mongoDb = mongoClient.get_database('self-taught-lr')

        rawData = []
        if lrtype != "Any":
            for i in range(0, len(newResources['skills'])):
                if newResources['ranges'][i] == '1' or newResources['ranges'][i] == '2':
                    rawData.extend(list(mongoDb['learning-resources'].find({"title": {"$in": [re.compile(
                        re.escape(newResources['skills'][i]), re.IGNORECASE)]}, "type": lrtype, "difficulty": "Beginner"}, {'_id': False})))
                elif newResources['ranges'][i] == '3':
                    rawData.extend(list(mongoDb['learning-resources'].find({"title": {"$in": [re.compile(
                        re.escape(newResources['skills'][i]), re.IGNORECASE)]}, "type": lrtype, "difficulty": "Intermediate"}, {'_id': False})))
                elif newResources['ranges'][i] == '4' or newResources['ranges'][i] == '5':
                    rawData.extend(list(mongoDb['learning-resources'].find({"title": {"$in": [re.compile(
                        re.escape(newResources['skills'][i]), re.IGNORECASE)]}, "type": lrtype, "difficulty": "Advanced"}, {'_id': False})))
        else:
            for i in range(0, len(newResources['skills'])):
                if newResources['ranges'][i] == '1' or newResources['ranges'][i] == '2':
                    rawData.extend(list(mongoDb['learning-resources'].find({"title": {"$in": [re.compile(
                        re.escape(newResources['skills'][i]), re.IGNORECASE)]}, "difficulty": "Beginner"}, {'_id': False})))
                elif newResources['ranges'][i] == '3':
                    rawData.extend(list(mongoDb['learning-resources'].find({"title": {"$in": [re.compile(
                        re.escape(newResources['skills'][i]), re.IGNORECASE)]}, "difficulty": "Intermediate"}, {'_id': False})))
                elif newResources['ranges'][i] == '4' or newResources['ranges'][i] == '5':
                    rawData.extend(list(mongoDb['learning-resources'].find({"title": {"$in": [re.compile(
                        re.escape(newResources['skills'][i]), re.IGNORECASE)]}, "difficulty": "Advanced"}, {'_id': False})))
        
        data = []
        for lrSorting in lrSortings:
            for lr in rawData:
                if lrSorting == lr['lrId']:
                    data.append(lr)
                    break
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
        print(json.dumps(resources))

recommendSkill = RecommendSkill()
recommendSkill.contentAndCollaborativeBasedFiltering()