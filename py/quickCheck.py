import sys
import json
from bs4 import BeautifulSoup
from urllib.request import urlopen

link = sys.argv[1]
# link = "https://www.skillshare.com/classes/Fundamentals-of-DSLR-Photography/1111783378" #no
# link = "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics" #yes
try:
    soup = BeautifulSoup(urlopen(link), "lxml")
    title = ""
    description = ""
    if (soup.title is not None):
        title = soup.title.string
    description = soup.find('meta', attrs={'name': 'description'})['content']

    skillsFile = open('tmp/skills.json', encoding="utf8")
    skills = json.load(skillsFile)

    failed = True
    for skill in skills:
        if (" " + skill.lower() + " ") in title.lower() or (" " + skill.lower() + " ") in description.lower():
            failed = False
            print(json.dumps("passed"))
            break
    if failed:
        for ti in title.split():
            if ti.lower() in skill.lower():
                failed = False
                print(json.dumps("passed"))
                break
    if failed:
        for desc in description.split():
            if desc.lower() in skill.lower():
                failed = False
                print(json.dumps("passed"))
                break
    if failed:
        print(json.dumps("failed"))
except:
    print(json.dumps("error"))
