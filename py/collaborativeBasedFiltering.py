import json
import pandas as pd
from math import sqrt
import sys
import os
import pymongo
from dotenv import load_dotenv
from bson import json_util
import dns


dotenv_path = './.env'  # init .env
load_dotenv(dotenv_path)


class CollaborativeBasedFiltering:
    def organize(self):
        # storing info to pandas dataframe
        mongoClient = pymongo.MongoClient(
            os.environ.get("MONGO_CONNECTION_STRING"))
        mongoDbLr = mongoClient.get_database('self-taught-lr')
        mongoDbRec = mongoClient.get_database('self-taught-recommender')
        lr_df = pd.read_json(json_util.dumps(
            mongoDbLr['learning-resources'].find()))
        rating_df = pd.read_json(json_util.dumps(mongoDbRec['ratings'].find()))

        # Only run this script when the user visits new links but first the link must be added to the ratings json file or else the program will crash

        # simulate is a user's account

        #title, link, type and rating
        userInput = json_util.loads(sys.argv[1])

        # userInput = [{"title": "Iterators in Functional Programming with Python | Udemy", "description": "Get a thorough understanding of iterators a crucial part of every Python programmers toolbox to solve many realworld",
        #               "link": "https://www.udemy.com/course/iterators-in-functional-programming-with-python/", "rating": 2.5}]

        # userInput = [
        #     {'title':'Iterators in Functional Programming with Python | Udemy','description':'Get a thorough understanding of iterators a crucial part of every Python programmers toolbox to solve many realworld','link':'https://www.udemy.com/course/iterators-in-functional-programming-with-python/','rating':2.5},
        #     {'title':'Design DataDriven Framework in 100 mins|Selenium|Java|TestNG | Udemy','description':'Step by Step designing  of end to end customised framework for Selenium with Java | Apache POI | Maven','link':'https://www.udemy.com/course/datadrivenframework/','rating':3.5}
        # ]

        # userInput = [
        # {'title':'Demystifying Parallax: Learn to Create Interactive Web Pages | Udemy','description':'With JavaScript, HTML & CSS','link':'https://www.udemy.com/course/demystifying-parallax-learn-to-create-interactive-web-pages/','type':'Online Course','rating':5},
        # {'title':'Create An Online Poll Maker From Scratch: PHP and MySQLI | Udemy','description':'Use HTML, CSS, Javascript, PHP and MySQL To Create Your Own Online Poll Maker','link':'https://www.udemy.com/course/create-an-online-poll-maker-from-scratch-php-and-mysqli/','type':'Online Course', 'rating':3.5},
        # {'title':'Android Development Working With Databases Using Mysql & PHP | Udemy', 'description':'In this complete course students will learn android development by working with databases using Mysql and PHP','link':'https://www.udemy.com/course/android-development-course/','type':'Online Course','rating':2},
        # {'title':"Advanced Corporate Level WordPress Training for 2020 | Udemy",'description':'WordPress Web Design - Beginners to advanced level WordPress training course','link':'https://www.udemy.com/course/advance-wordpress-2020-lectures/','type':'Online Course', 'rating':5},
        # {'title':'Exploring SQL Server 2016: Intermediate | Udemy','description':'Exploring SQL Server 2016: Intermediate','link':'https://www.udemy.com/course/exploring-sql-server-2016-intermediate/','type':'Online Course', 'rating':4.5}
        # ]
        input_lr = pd.DataFrame(userInput)

        # Filtering out the lr by title
        inputId = lr_df[lr_df['title'].isin(input_lr['title'].tolist())]
        # Then merging it so we can get the lrId. It's implicitly merging it by title.
        input_lr = pd.merge(inputId, input_lr)

        # print(input_lr.head())

        # Filtering out users that have learned from lr that the input has watched and storing it

        userSubset = rating_df[rating_df['lrId'].isin(
            input_lr['lrId'].tolist())]
        # Groupby creates several sub dataframes where they all have the same value in the column specified as the parameter
        userSubsetGroup = userSubset.groupby(['userId'])
        # print(userSubset.head())

        # Sorting it so users with lr most in common with the input will have priority
        userSubsetGroup = sorted(
            userSubsetGroup, key=lambda x: len(x[1]), reverse=True)

        userSubsetGroup = userSubsetGroup[0:100]

        # Store the Pearson Correlation in a dictionary, where the key is the user Id and the value is the coefficient
        pearsonCorrelationDict = {}
        # For every user group in our subset
        for name, group in userSubsetGroup:
            # Start by sorting the input and current user group so the values aren't mixed up later on
            group = group.sort_values(by='lrId')
            input_lr = input_lr.sort_values(by='lrId')
            # Get the N for the formula
            nRatings = len(group)
            # Get the review scores for the lr that they both have in common
            temp_df = input_lr[input_lr['lrId'].isin(group['lrId'].tolist())]
            # And then store them in a temporary buffer variable in a list format to facilitate future calculations
            tempRatingList = temp_df['rating'].tolist()
            # Let's also put the current user group reviews in a list format
            tempGroupList = group['rating'].tolist()
            # Now let's calculate the pearson correlation between two users, so called, x and y
            Sxx = sum([i**2 for i in tempRatingList]) - \
                pow(sum(tempRatingList), 2)/float(nRatings)
            Syy = sum([i**2 for i in tempGroupList]) - \
                pow(sum(tempGroupList), 2)/float(nRatings)
            Sxy = sum(i*j for i, j in zip(tempRatingList, tempGroupList)) - \
                sum(tempRatingList)*sum(tempGroupList)/float(nRatings)
            # If the denominator is different than zero, then divide, else, 0 correlation.
            if Sxx != 0 and Syy != 0 and not (Sxx > 0 and Syy < 0) and not (Sxx < 0 and Syy > 0):
                pearsonCorrelationDict[name] = Sxy/sqrt(Sxx*Syy)
            else:
                pearsonCorrelationDict[name] = 0

        pearsonDF = pd.DataFrame.from_dict(
            pearsonCorrelationDict, orient='index')
        pearsonDF.columns = ['similarityIndex']
        pearsonDF['userId'] = pearsonDF.index
        pearsonDF.index = range(len(pearsonDF))
        # print(pearsonDF.head())

        topUsers = pearsonDF.sort_values(
            by='similarityIndex', ascending=False)[0:50]

        topUsersRating = topUsers.merge(
            rating_df, left_on='userId', right_on='userId', how='inner')

        # Multiplies the similarity by the user's ratings
        topUsersRating['weightedRating'] = topUsersRating['similarityIndex'] * \
            topUsersRating['rating']  # curesed

        # Applies a sum to the topUsers after grouping it up by userId
        tempTopUsersRating = topUsersRating.groupby(
            'lrId').sum()[['similarityIndex', 'weightedRating']]
        tempTopUsersRating.columns = [
            'sum_similarityIndex', 'sum_weightedRating']

        # print(tempTopUsersRating.head())

        # Creates an empty dataframe
        recommendation_df = pd.DataFrame()
        # Take the weighted average
        recommendation_df['weighted average recommendation score'] = tempTopUsersRating['sum_weightedRating'] / \
            tempTopUsersRating['sum_similarityIndex']
        recommendation_df['lrId'] = tempTopUsersRating.index
        # print(recommendation_df.head())

        recommendation_df = recommendation_df.sort_values(
            by='weighted average recommendation score', ascending=False)

        # print(recommendation_df.head(3))
        # print(lr_df.loc[lr_df['lrId'].isin(recommendation_df.head(int(recommendation_df.size*0.025))['lrId'].tolist())])

        #{"_id":{"$oid":"60978f0c6f4bbd44a7d12409"},"undefined":"{\"title\":\"Mastering Clean Code in JavaScript | Udemy\",\"description\":\"Learning the JavaScript framework is good and cleaner JavaScript is even better\",\"link\":\"https://www.udemy.com/course/mastering-clean-code-in-javascript/\",\"type\":\"Online Course\",\"lrId\":1,\"difficulty\":\"Beginner\"}"}

        # this is how we'll pass the results from python to node.js, kinda slow, we need to improve it - had hard times doing it myself

        ###
        # Improvement could be only passing lrId's, then adding the rest (missing ones)
        # at the end of the array in Python then in Node.js I do array1 = array2.map((object, i) => array1[object]);
        # array1: array of elements to be sorted & array2: array with the indices
        ###

        lrData = json_util.loads(json_util.dumps(
            mongoDbLr['learning-resources'].find({}, {'_id': False})))
        toBePrinted = []
        for rec in recommendation_df['lrId']:
            for lr in lrData:
                if rec == lr['lrId']:
                    toBePrinted.append(rec)
                    break

        for lr in lrData:
            if lr['lrId'] not in toBePrinted: #4262
                toBePrinted.append(lr['lrId'])
        # remove visisted links
        for userin in userInput:
            for tbp in toBePrinted:
                if userin['lrid'] == tbp:
                    toBePrinted.remove(tbp)
                    break

        print(json.dumps(toBePrinted))


collaborativeBasedFiltering = CollaborativeBasedFiltering()
collaborativeBasedFiltering.organize()
