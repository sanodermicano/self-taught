import nltk, re, pprint, json
from nltk import word_tokenize
from nltk.collocations import BigramCollocationFinder, TrigramCollocationFinder
from nltk.metrics import f_measure, BigramAssocMeasures, TrigramAssocMeasures
from urllib import request
from difflib import SequenceMatcher
import itertools
import os
from nltk.tokenize import WhitespaceTokenizer
import random

if not os.path.exists('tmp/learningResources.json'):
    f = open('tmp/learningResources.json', "w")
    json.dump([], f)
    f.close()

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def removeDuplicatesReverse(arr):
    seen = set()
    seen_add = seen.add
    return [x for x in arr[::-1] if not (x in seen or seen_add(x))][::-1]

    
#source https://www.nltk.org/book/ch03.html
with open('tmp/skilltree.json', encoding="utf8") as json_file:
    data = json.load(json_file)
    
    allData = ""
    for i in range(0, len(data)):
        allData+=data[i]['parent'] + " "
        for j in range(len(data[i]['children'])):
            allData+=data[i]['children'][j] + " "
        # allData+=data[i]['parent'] + ", "
        # for j in range(len(data[i]['children'])):
        #     allData+=data[i]['children'][j] + ", "
    allData = allData[:-1]
    # print (len(allData))

    tokens = WhitespaceTokenizer().tokenize(allData)
    # tokens = word_tokenize(allData)
    # tokens = nltk.wordpunct_tokenize(allData)

    #https://www.nltk.org/_modules/nltk/text.html
    # print(nltk.Text(tokens).collocation_list(int(len(data)*0.05), 2)) #best results if only it can be turned into a string
    #how to accesss it
    # for c in nltk.Text(tokens).collocation_list(int(len(data)*0.05), 2):
    #     print(c[0] + " - " + c[1])

    #whatever I'm doing
    from nltk.corpus import stopwords

    winSize = 3
    # colNum = int(len(data)*0.085)
    colNum = int(len(data)*0.09)

    #SingleTopWords
    # allWordDist = nltk.FreqDist(w.lower() for w in tokens)
    allWordDist = nltk.FreqDist(tokens)
    mostCommon = dict(allWordDist.most_common(int(colNum*2)))
    # mostCommon = dict(allWordDist.most_common(50))
    singleWords = list(mostCommon.keys())
    # print(singleWords)
    # print("______________________________________________________")
    for a, b in itertools.combinations(singleWords, 2):
        if a not in singleWords or b not in singleWords:
            continue
        index = singleWords.index(b)
        similarity = similar(a, b)
        if(similarity > 0.9 or a.lower() == b.lower()):
            # print("removed " + singleWords[index])
            singleWords.pop(index)
    # print(singleWords)
    # print("______________________________________________________")

    #biCollocation____________________________________________________________________________________________________________
    finder = BigramCollocationFinder.from_words(tokens, winSize)
    finder.apply_freq_filter(3)
    finder.apply_word_filter(lambda w: len(w) < 3)
    bigram_measures = BigramAssocMeasures()
    biCollocations = list(finder.nbest(bigram_measures.likelihood_ratio, colNum*2))
    # biCollocations = list(finder.nbest(bigram_measures.likelihood_ratio, 30))
    biSentence = []
    for i in biCollocations:
        biSentence.append(i[0] + " " + i[1])
    # print(biSentence)
    # print("______________________________________________________")
    # print(len(biSentence))

    # print("______________________________________________________")

    for a, b in itertools.combinations(biSentence, 2):
        if a not in biSentence or b not in biSentence:
            continue
        index = biSentence.index(b)
        cosine = similar(a, b)
        bSplit = b.split()
        if cosine > 0.85 or sorted(a.split()) == sorted(b.split()) or bSplit[0].lower() == bSplit[1].lower():
            # print("removed " + biSentence[index])
            biSentence.pop(index)


    # print(biSentence)
    # print("______________________________________________________")
    # print(len(biSentence))

    #combining the first two lists
    for a, b in itertools.combinations(singleWords, 2):
        if a not in singleWords or b not in singleWords:
            continue
        index = singleWords.index(b)
        similarity = similar(a, b)
        if(similarity > 0.85):
            # print("removed " + singleWords[index])
            singleWords.pop(index)
    
    for s in singleWords:
        if s not in singleWords:
            continue
        for b in biSentence:
            if b not in biSentence:
                continue
            index = singleWords.index(s)
            similarity = similar(s, b)
            if similarity > 0.8:
            # if similarity > 0.75 or s.lower() in b.lower():
                # print("removed " + singleWords[index])
                singleWords.pop(index)
                break
    # print("______________________________________________________")
    # print(singleWords)

    #triCollocation____________________________________________________________________________________________________________
    triFinder = TrigramCollocationFinder.from_words(tokens, winSize)
    triFinder.apply_freq_filter(2)
    triFinder.apply_word_filter(lambda w: len(w) < 3)
    trigram_measures = TrigramAssocMeasures()
    triCollocations = list(triFinder.nbest(trigram_measures.likelihood_ratio, int(colNum/3.5)))
    # triCollocations = list(triFinder.nbest(trigram_measures.likelihood_ratio, 10))
    triSentence = []
    for i in triCollocations:
        triSentence.append(i[0] + " " + i[1] + " " + i[2])
    # print(triCollocations)

    for a, b in itertools.combinations(triSentence, 2):
        if a not in triSentence or b not in triSentence:
            continue
        index = triSentence.index(b)
        cosine = similar(a, b)
        if(cosine > 0.55):
            # print("removed " + triSentence[index])
            triSentence.pop(index)

    for s in singleWords:
        if s not in singleWords:
            continue
        for b in triSentence:
            if b not in triSentence:
                continue
            index = singleWords.index(s)
            similarity = similar(s, b)
            if(similarity > 0.88 or s.lower() in b.lower()):
                # print("removed " + singleWords[index])
                singleWords.pop(index)
                break
    # print("______________________________________________________")
    # print(singleWords)

    for s in triSentence:
        if s not in triSentence:
            continue
        for b in biSentence:
            if b not in biSentence:
                continue
            index = triSentence.index(s)
            similarity = similar(s, b)
            # if(similarity > 0.85 or s.lower() in b.lower()):
            if(similarity > 0.85):
                # print("removed " + triSentence[index])
                triSentence.pop(index)
                break
    # print("______________________________________________________")
    # print(biSentence)
    # singleWords = singleWords[int(len(singleWords)*0.01):]
    # singleWords = singleWords[4:]
    singleWords.insert(0, "Java")
    singleWords.insert(0, "JavaScript")
    if "Stack" in singleWords:
        singleWords.remove("Stack") #Full Stack is keeping Stack alone, might as well remove it to support stack overflow
    if "flow" in singleWords:
        singleWords.remove("flow")
    if "Learning" in singleWords:
        singleWords.remove("Learning")
    if "learning" in singleWords:
        singleWords.remove("learning")
    if "Software" in singleWords:
        singleWords.remove("Software")
    if "software" in singleWords:
        singleWords.remove("software")
    if "Data" in singleWords:
        singleWords.remove("Data")
    if "data" in singleWords:
        singleWords.remove("data")
    listOfSkills = singleWords + biSentence + triSentence
    random.shuffle(listOfSkills)
    with open('tmp/skills.json', 'w') as outfile:
        json.dump(listOfSkills, outfile)

    # print(len(listOfSkills))
    # print("______________________________________________________")
    # print(listOfSkills)

#leftovers: add biCollocations, triCollocations and most common single words as skills to choose from, remove similar collocations (e.g. css html & 
# html css, # smaller collocation is more important) and when the user is receiving a skill prediction do an opposite comparison, if the text of the 
# collocations are in the received predictions from skilltree.json then add the collocation as a prediction

#Use stemming to remove words like "developer"

#To receive prediction, use an element of listOfSkills as input for predict.py then do the same process in this file to generate predicted skills like
#in this one, also remove some of the flitering processes in buildTree.py
#another way to do it is to simply remove garbage words that are not in listOfSkills, done!

#while polishing the code, make sure to make things more efficient, some things take so much time already