import json
import re
import os
import pymongo
from dotenv import load_dotenv
from bson import json_util

dotenv_path = './.env' #init .env
load_dotenv(dotenv_path)

class BuildTree:
    def removeDuplicatesReverse(self, arr):
        seen = set()
        seen_add = seen.add
        return [x for x in arr[::-1] if not (x in seen or seen_add(x))][::-1]
    
    def buildSkillTree(self):
        mongoClient = pymongo.MongoClient(os.environ.get("MONGO_CONNECTION_STRING"))
        mongoDb = mongoClient.get_database('self-taught-stb')

        data = list(mongoDb['raw-data'].find({}, {'_id': False}))
        stopwordsfile = open('py/stopwords.txt', 'r') #make sure this works
        stopwords = [line.replace('\n', '') for line in stopwordsfile.readlines()]

        for i in range(0, len(data)):
            data[i]['parent'] = ' '.join([word for word in re.split("[^A-Za-z0-9+#-]",data[i]['parent']) if word.lower() not in stopwords])
            data[i]['parent'] = re.sub(' +', ' ', data[i]['parent']).strip()

            if isinstance(data[i]['children'], str):
                    data[i]['children'] = ' '.join([word for word in re.split("[^A-Za-z0-9+#-]",data[i]['children']) if word.lower() not in stopwords])
                    data[i]['children'] = re.sub(' +', ' ', data[i]['children']).strip()
            else:
                for j in range(len(data[i]['children'])):
                    data[i]['children'][j] = ' '.join([word for word in re.split("[^A-Za-z0-9+#-]",data[i]['children'][j]) if word.lower() not in stopwords])
                    data[i]['children'][j] = re.sub(' +', ' ', data[i]['children'][j]).strip()


        # for index in range(0, len(data)//10):
        for index in range(0, 5):
            # remove duplicates in reverse
            for dataElement in data:
                data[data.index(dataElement)]['parent'] = ' '.join(self.removeDuplicatesReverse(dataElement['parent'].split(' ')))
                # data[data.index(dataElement)]['parent'] = ' '.join(list(set(dataElement['parent'].split(' '))))


            #merge Parents
            for dataElement in data:
                for anotherDataElement in data[1:]:
                    if dataElement['parent'].lower() == anotherDataElement['parent'].lower() and dataElement != anotherDataElement:
                        if dataElement in data:
                            data[data.index(dataElement)]['children'] = dataElement['children'] + anotherDataElement['children']
                            data.remove(anotherDataElement)


            for dataElement in data:
                if isinstance(dataElement['children'], str):
                    data[data.index(dataElement)]['children'] = ' '.join(self.removeDuplicatesReverse(dataElement['children'].split(' ')))
                else:
                    for j in range(0, len(dataElement['children'])):
                        data[data.index(dataElement)]['children'][j] = ' '.join(self.removeDuplicatesReverse(dataElement['children'][j].split(' ')))
            for dataElement in data:
                data[data.index(dataElement)]['children'] = self.removeDuplicatesReverse(dataElement['children'])

            # remove parent words from children
            # for dataElement in data:
            #     for allChildren in dataElement['children']:
            #         childrenIndex = dataElement['children'].index(allChildren)
            #         childrenWords = allChildren.split(' ')
            #         parentWords = dataElement['parent'].split(' ')
            #         for parentWord in parentWords:
            #             for childWord in childrenWords:
            #                 if parentWord.lower() in childWord.lower() or childWord.lower() in dataElement['parent'].lower():
            #                     childrenWords[childrenWords.index(childWord)] = childrenWords[childrenWords.index(childWord)].replace(parentWord, '')
            #         dataElement['children'][childrenIndex] = ' '.join(childrenWords)

                
            #remove empty children
            for dataElement in data:
                if isinstance(dataElement['children'], str):
                    if not dataElement['children']:
                        data[data.index(dataElement)]['children'].remove(dataElement['children'])
                else:
                    for j in range(0, len(dataElement['children'])):
                        if not dataElement['children'][j]:
                            data[data.index(dataElement)]['children'].remove(dataElement['children'][j])
                            break

            # if the parent had one child and both had the same exact string, delete both
            for dataElement in data:
                if len(dataElement['children']) == 0 or (len(dataElement['children']) == 1 and dataElement['children'][0].lower() == dataElement['parent'].lower()):
                    data.remove(dataElement)


            # if parent is empty
            for dataElement in data:
                if not dataElement['parent']:
                    data.remove(dataElement)

        mongoDb['skilltree'].delete_many({})
        mongoDb['skilltree'].insert_many(data)

buildTree = BuildTree()
buildTree.buildSkillTree()