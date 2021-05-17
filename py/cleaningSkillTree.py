import nltk
import re
import pprint
import json
from nltk import word_tokenize
from nltk.collocations import BigramCollocationFinder, TrigramCollocationFinder
from nltk.metrics import f_measure, BigramAssocMeasures, TrigramAssocMeasures
from urllib import request
from difflib import SequenceMatcher
import itertools
import os
from nltk.tokenize import WhitespaceTokenizer
import random
import pymongo
from dotenv import load_dotenv
import dns

dotenv_path = './.env'  # init .env
load_dotenv(dotenv_path)


class CleaningSkillTree:
    def similar(self, a, b):
        return SequenceMatcher(None, a, b).ratio()

    def cleanTree(self):
        # source https://www.nltk.org/book/ch03.html
        mongoClient = pymongo.MongoClient(
            os.environ.get("MONGO_CONNECTION_STRING"))
        mongoDb = mongoClient.get_database('self-taught-stb')

        data = list(mongoDb['skilltree'].find({}, {'_id': False}))

        allData = ""
        for i in range(0, len(data)):
            allData += data[i]['parent'] + " "
            for j in range(len(data[i]['children'])):
                allData += data[i]['children'][j] + " "
        allData = allData[:-1]

        tokens = WhitespaceTokenizer().tokenize(allData)

        # https://www.nltk.org/_modules/nltk/text.html
        from nltk.corpus import stopwords

        winSize = 3
        colNum = int(len(data)*0.13)

        # SingleTopWords________________________________
        allWordDist = nltk.FreqDist(tokens)
        mostCommon = dict(allWordDist.most_common(int(colNum*2)))
        singleWords = list(mostCommon.keys())
        for a, b in itertools.combinations(singleWords, 2):
            if a not in singleWords or b not in singleWords:
                continue
            index = singleWords.index(b)
            similarity = self.similar(a, b)
            if(similarity > 0.9 or a.lower() == b.lower()):
                singleWords.pop(index)

        # biCollocation_________________________________
        finder = BigramCollocationFinder.from_words(tokens, winSize)
        finder.apply_freq_filter(3)
        finder.apply_word_filter(lambda w: len(w) < 3)
        bigram_measures = BigramAssocMeasures()
        biCollocations = list(finder.nbest(
            bigram_measures.likelihood_ratio, int(colNum*2.5)))
        biSentence = []
        for i in biCollocations:
            biSentence.append(i[0] + " " + i[1])

        for a, b in itertools.combinations(biSentence, 2):
            if a not in biSentence or b not in biSentence:
                continue
            index = biSentence.index(b)
            cosine = self.similar(a, b)
            bSplit = b.split()
            if cosine > 0.85 or sorted(a.split()) == sorted(b.split()) or bSplit[0].lower() == bSplit[1].lower():
                biSentence.pop(index)

        # combining the first two lists
        for a, b in itertools.combinations(singleWords, 2):
            if a not in singleWords or b not in singleWords:
                continue
            index = singleWords.index(b)
            similarity = self.similar(a, b)
            if(similarity > 0.85):
                singleWords.pop(index)

        for s in singleWords:
            if s not in singleWords:
                continue
            for b in biSentence:
                if b not in biSentence:
                    continue
                index = singleWords.index(s)
                similarity = self.similar(s, b)
                if similarity > 0.8:
                    singleWords.pop(index)
                    break

        # triCollocation_____________________________________
        triFinder = TrigramCollocationFinder.from_words(tokens, winSize)
        triFinder.apply_freq_filter(2)
        triFinder.apply_word_filter(lambda w: len(w) < 3)
        trigram_measures = TrigramAssocMeasures()
        triCollocations = list(triFinder.nbest(
            trigram_measures.likelihood_ratio, int(colNum/2.5)))
        triSentence = []
        for i in triCollocations:
            triSentence.append(i[0] + " " + i[1] + " " + i[2])

        for a, b in itertools.combinations(triSentence, 2):
            if a not in triSentence or b not in triSentence:
                continue
            index = triSentence.index(b)
            cosine = self.similar(a, b)
            if(cosine > 0.55):
                triSentence.pop(index)

        # for s in singleWords:  #unnecessarily removing stuff
        #     if s not in singleWords:
        #         continue
        #     for b in triSentence:
        #         if b not in triSentence:
        #             continue
        #         index = singleWords.index(s)
        #         similarity = self.similar(s, b)
        #         if(similarity > 0.88 or s.lower() in b.lower()):
        #             singleWords.pop(index)
        #             break

        # print("Java exists 4?: ", "Java" in singleWords)

        for s in triSentence:
            if s not in triSentence:
                continue
            for b in biSentence:
                if b not in biSentence:
                    continue
                index = triSentence.index(s)
                similarity = self.similar(s, b)
                if(similarity > 0.85):
                    triSentence.pop(index)
                    break

        #stopwords should be on two stages
        stopwords = ["stack", "flow", "overflow", "learning", "software",
                     "data", "core", "full", "pattern", "desktop", "tuning", 
                     "amazon", "image", "host", "texture", "assets", "back", 
                     "front", "upgrade", "platforms", "integrated", "reverse",
                     "securing", "after", "graphic", "driven", "patterns", 
                     "house", "web", "game", "reality", "virtual", "augmented",
                     "boot", "big", "machine", "deep", "native", "field", 
                     "production", "engine", "human", "tier", "lot", "in-depth", 
                     "productivity", "case", "remote", "end", "packet", "smart"
                     "timing", "comic", "computing", "adobe", "personal", "flat"]  # must be small letter

        for s in singleWords:
            if s.lower() in stopwords or s.lower().isdigit():
                singleWords.remove(s)

        listOfSkills = singleWords + biSentence + triSentence
        random.shuffle(listOfSkills)

        # noSQL
        mongoDb['skills'].replace_one({}, {"skills": listOfSkills})


cleaningSkillTree = CleaningSkillTree()
cleaningSkillTree.cleanTree()
