#NEW: what needs to be done is compare frequency in the html file to decide the website's type, then we append the title, description, link and type into the existing learningResources.json
import json
import sys
#make it less hard-coded
import os.path

if not os.path.exists('tmp/learningResources.json'):
    f = open('tmp/learningResources.json', "w")
    json.dump([], f)
    f.close()

with open('tmp/learningResources.json', 'r+', encoding='utf8') as file:
    data = json.load(file)
    # newResource = sys.argv[1].split(",") #mayb not a good idea to split using ,
    # resource = {'title':'Fingerstyle Guitar For Beginners | STEP BY STEP Course | Udemy', 'description':'Learn To Play Fingerstyle Guitar and Percussive Fingerstyle In A Simple Proven Way! You will play 20 awesome songs', 'link':'https://www.udemy.com/course/fingerstyle-guitar-for-beginners-step-by-step-course/', 'type':'Online Course'}
    resource = json.loads(sys.argv[1])
    if resource not in data:
        file.seek(0)
        data.append(resource)
        file.truncate(0)
        json.dump(data, file)
    file.close()
