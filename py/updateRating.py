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
    for rating in ratings:
        if rating['userId'] == newRating['userId'] and rating['lrId'] == newRating['lrId']:
            ratings[ratings.index(rating)]['rating'] = newRating['rating']
            break

    file.truncate(0)
    json.dump(ratings, file)
    file.close()
