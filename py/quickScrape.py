import sys
import json
from bs4 import BeautifulSoup
from urllib.request import urlopen
import dns

class QuickScrape:
    def scrape(self):
        # link = "https://www.udemy.com/course/the-complete-web-development-bootcamp/"
        # link = "https://stackoverflow.com/questions/18134318/extracting-contents-from-specific-meta-tags-that-are-not-closed-using-beautifuls" #fails
        link = sys.argv[1]
        try:
            # soup = BeautifulSoup(urlopen(link), "lxml")
            soup = BeautifulSoup(urlopen(link), "html.parser")
            title = ""
            description = ""
            if soup.title is not None:
                title = soup.title.string
            if soup.find('meta', attrs={'name': 'description'}) is not None:
                description = soup.find('meta', attrs={'name': 'description'})['content']

            learningResource = []
            if (title is None or title == "") and (description is None or description == ""):
                print(json.dumps("Failed"))
                return

            if title is not None:
                learningResource.append(title)
            if description is not None:
                learningResource.append(description)
            print(json.dumps(learningResource))
        except Exception as e:
            print(json.dumps("Failed"))
            # raise Exception(e)

quickScrape = QuickScrape()
quickScrape.scrape()