#NEW: what needs to be done is compare frequency in the html file to decide the website's type, then we append the title, description, link and type into the existing learningResources.json
import json
import sys
import os.path

if not os.path.exists('tmp/ratings.json'):
    f = open('tmp/ratings.json', "w")
    json.dump([], f)
    f.close()

with open('tmp/ratings.json', 'r+', encoding='utf8') as file:
    ratings = json.load(file)
    newRating = json.loads(sys.argv[1])
    file.seek(0)
    failed = False
    for rating in ratings:
        if rating['userId'] == newRating['userId'] and rating['lrId'] == newRating['lrId']:
            failed = True
            break

    if not failed:
        ratings.append(newRating)
        file.truncate(0)
        json.dump(ratings, file)
    file.close()
