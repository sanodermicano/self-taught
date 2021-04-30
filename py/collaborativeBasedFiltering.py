import json
import pandas as pd
from math import sqrt
import sys

#storing info to pandas dataframe
lr_df = pd.read_json('tmp/learningResources.json')
rating_df=pd.read_json('tmp/ratings.json')


#Only run this script when the user visits new links but first the link must be added to the ratings json file or else the program will crash

#simulate is a user's account

userInput = json.loads(sys.argv[1])
# userInput = [
# {'title':'Demystifying Parallax: Learn to Create Interactive Web Pages | Udemy','description':'With JavaScript, HTML & CSS','link':'https://www.udemy.com/course/demystifying-parallax-learn-to-create-interactive-web-pages/','type':'Online Course','rating':5},
# {'title':'Create An Online Poll Maker From Scratch: PHP and MySQLI | Udemy','description':'Use HTML, CSS, Javascript, PHP and MySQL To Create Your Own Online Poll Maker','link':'https://www.udemy.com/course/create-an-online-poll-maker-from-scratch-php-and-mysqli/','type':'Online Course', 'rating':3.5},
# {'title':'Android Development Working With Databases Using Mysql & PHP | Udemy', 'description':'In this complete course students will learn android development by working with databases using Mysql and PHP','link':'https://www.udemy.com/course/android-development-course/','type':'Online Course','rating':2},
# {'title':"Advanced Corporate Level WordPress Training for 2020 | Udemy",'description':'WordPress Web Design - Beginners to advanced level WordPress training course','link':'https://www.udemy.com/course/advance-wordpress-2020-lectures/','type':'Online Course', 'rating':5},
# {'title':'Exploring SQL Server 2016: Intermediate | Udemy','description':'Exploring SQL Server 2016: Intermediate','link':'https://www.udemy.com/course/exploring-sql-server-2016-intermediate/','type':'Online Course', 'rating':4.5}
# ]
input_lr = pd.DataFrame(userInput)

#Filtering out the lr by title
inputId = lr_df[lr_df['title'].isin(input_lr['title'].tolist())]
#Then merging it so we can get the lrId. It's implicitly merging it by title.
input_lr= pd.merge(inputId, input_lr)

#print(input_lr.head())


#Filtering out users that have learned from lr that the input has watched and storing it

userSubset = rating_df[rating_df['lrId'].isin(input_lr['lrId'].tolist())]
#Groupby creates several sub dataframes where they all have the same value in the column specified as the parameter
userSubsetGroup = userSubset.groupby(['userId'])
#print(userSubset.head())

#Sorting it so users with lr most in common with the input will have priority
userSubsetGroup = sorted(userSubsetGroup, key=lambda x: len(x[1]), reverse=True)

userSubsetGroup = userSubsetGroup[0:100]


#Store the Pearson Correlation in a dictionary, where the key is the user Id and the value is the coefficient
pearsonCorrelationDict = {}
#For every user group in our subset
for name, group in userSubsetGroup:
    #Start by sorting the input and current user group so the values aren't mixed up later on
    group = group.sort_values(by='lrId')
    input_lr = input_lr.sort_values(by='lrId')
    #Get the N for the formula
    nRatings = len(group)
    #Get the review scores for the lr that they both have in common
    temp_df = input_lr[input_lr['lrId'].isin(group['lrId'].tolist())]
    #And then store them in a temporary buffer variable in a list format to facilitate future calculations
    tempRatingList = temp_df['rating'].tolist()
    #Let's also put the current user group reviews in a list format
    tempGroupList = group['rating'].tolist()
    #Now let's calculate the pearson correlation between two users, so called, x and y
    Sxx = sum([i**2 for i in tempRatingList]) - pow(sum(tempRatingList),2)/float(nRatings)
    Syy = sum([i**2 for i in tempGroupList]) - pow(sum(tempGroupList),2)/float(nRatings)
    Sxy = sum( i*j for i, j in zip(tempRatingList, tempGroupList)) - sum(tempRatingList)*sum(tempGroupList)/float(nRatings)
    #If the denominator is different than zero, then divide, else, 0 correlation.
    if Sxx != 0 and Syy != 0:
        pearsonCorrelationDict[name] = Sxy/sqrt(Sxx*Syy)
    else:
        pearsonCorrelationDict[name] = 0

pearsonDF = pd.DataFrame.from_dict(pearsonCorrelationDict, orient='index')
pearsonDF.columns = ['similarityIndex']
pearsonDF['userId'] = pearsonDF.index
pearsonDF.index = range(len(pearsonDF))
#print(pearsonDF.head())


topUsers=pearsonDF.sort_values(by='similarityIndex', ascending=False)[0:50]

topUsersRating=topUsers.merge(rating_df, left_on='userId', right_on='userId', how='inner')

#Multiplies the similarity by the user's ratings
topUsersRating['weightedRating'] = topUsersRating['similarityIndex']*topUsersRating['rating']

#Applies a sum to the topUsers after grouping it up by userId
tempTopUsersRating = topUsersRating.groupby('lrId').sum()[['similarityIndex','weightedRating']]
tempTopUsersRating.columns = ['sum_similarityIndex','sum_weightedRating']

#print(tempTopUsersRating.head())


#Creates an empty dataframe
recommendation_df = pd.DataFrame()
#Take the weighted average
recommendation_df['weighted average recommendation score'] = tempTopUsersRating['sum_weightedRating']/tempTopUsersRating['sum_similarityIndex']
recommendation_df['lrId'] = tempTopUsersRating.index
#print(recommendation_df.head())

recommendation_df = recommendation_df.sort_values(by='weighted average recommendation score', ascending=False)

# print(recommendation_df.head(3))
# print(lr_df.loc[lr_df['lrId'].isin(recommendation_df.head(int(recommendation_df.size*0.025))['lrId'].tolist())])


#this is how we'll pass the results from python to node.js, kinda slow, we need to improve it - had hard times doing it myself
lrJson = open('tmp/learningResources.json', "r+", encoding="utf8")
lrData = json.load(lrJson)
toBePrinted = []
for rec in recommendation_df['lrId']:
    for lr in lrData:
        if rec == lr['lrId']:
            toBePrinted.append(lr)
            break
# print(len(toBePrinted))
for lr in lrData:
    if lr['lrId'] not in recommendation_df['lrId']:
        toBePrinted.append(lr)

#remove visisted links
for userin in userInput:
    for tbp in toBePrinted:
        if userin['link'] == tbp['link']:
            toBePrinted.remove(tbp)
            break


lrJson.close()
# print(len(toBePrinted))
print(json.dumps(toBePrinted))