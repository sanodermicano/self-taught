import sys
import json
from bs4 import BeautifulSoup
from urllib.request import urlopen
import os
import pymongo
from dotenv import load_dotenv

dotenv_path = './.env' #init .env
load_dotenv(dotenv_path)

class QuickCheck:
    def checkLink(self):
        link = sys.argv[1]
        # link = "https://www.healthline.com/nutrition/foods/tomatoes"
        # link = "https://www.skillshare.com/classes/Fundamentals-of-DSLR-Photography/1111783378" #no
        # link = "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics" #yes
        try:
            soup = BeautifulSoup(urlopen(link), "lxml")
            title = ""
            description = ""
            if (soup.title is not None):
                title = soup.title.string
            description = soup.find('meta', attrs={'name': 'description'})['content']


            mongoClient = pymongo.MongoClient(os.environ.get("MONGO_CONNECTION_STRING"))
            mongoDb = mongoClient.get_database('self-taught-stb').skills
            skills = mongoDb.find_one()['skills']

            failed = True
            for skill in skills:
                if (" " + skill.lower() + " ") in title.lower() or (" " + skill.lower() + " ") in description.lower():
                    failed = False
                    print(json.dumps("passed"))
                    break
            if failed:
                for ti in title.split():
                    if (" " + ti.lower() + " ") in skill.lower() or ti.lower() == skill.lower():
                        failed = False
                        print(json.dumps("passed"))
                        break
            if failed:
                for desc in description.split():
                    if (" " + desc.lower() + " ") in skill.lower() or desc.lower() == skill.lower():
                        failed = False
                        print(json.dumps("passed"))
                        break
            if failed:
                print(json.dumps("failed"))
        except:
            print(json.dumps("error"))

quickCheck = QuickCheck()
quickCheck.checkLink()