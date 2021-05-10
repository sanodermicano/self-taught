import sys
import json
from bs4 import BeautifulSoup
from urllib.request import urlopen

class QuickScrape:
    def scrape(self):
        # link = "https://www.udemy.com/course/the-complete-web-development-bootcamp/"
        # link = "https://stackoverflow.com/questions/18134318/extracting-contents-from-specific-meta-tags-that-are-not-closed-using-beautifuls" #fails
        link = sys.argv[1]
        try:
            soup = BeautifulSoup(urlopen(link), "lxml")
            # soup = BeautifulSoup(urlopen(link), "html.parser")
            title = ""
            if (soup.title is not None):
                title = soup.title.string
            description = soup.find('meta', attrs={'name': 'description'})['content']

            learningResource = []
            if title is not None:
                learningResource.append(title)
            if description is not None:
                learningResource.append(description)
            print(json.dumps(learningResource))
        except:
            print(json.dumps("Failed"))

quickScrape = QuickScrape()
quickScrape.scrape()