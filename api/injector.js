require("dotenv").config();
const HCCrawler = require('headless-chrome-crawler');
const predController = require('./Predictor').predictor;
const jsonController = require('./JsonOperations').jsonOperations;
//https://nodejs.org/api/url.html
const url = require('url');

class Injector {
    constructor() {
        this.quickInjectFailed = false;
        injectLink.bind(this);
        quickInject.bind(this);
        quickCheck.bind(this);
        hccCheck.bind(this);
    }

    //methods    
    inject = async function (req, res) {
        if (!req.user) {
            return res.status(500).send();
        } else {
            try {
                // var enteredURL = JSON.stringify(req.body).split("\"")[1];
                var enteredURL = url.format(req.body['url']);
                console.log(JSON.stringify(req.body));
                console.log("enteredURL: " + enteredURL);

                const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                const expressionHTTP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                var regex = new RegExp(expression);
                var regexHTTP = new RegExp(expressionHTTP);

                if (enteredURL != null && enteredURL != '') {
                    if (!enteredURL.match(regex) || !enteredURL.match(regexHTTP)) {
                        console.log("not a url");
                        res.status(500).send();
                        return;
                    }
                    if (enteredURL.length > 10) {
                        if (enteredURL.includes("www.udemy.com") || enteredURL.includes("www.coursera.org") ||
                            enteredURL.includes("www.udacity.com") || enteredURL.includes("stackoverflow.com")) {
                            quickInject(enteredURL, res);
                        } else {
                            const bl = await jsonController.getBlockedLinks();
                            if (bl.includes(enteredURL)) {
                                console.log("in the blacklist");
                                res.status(500).send();
                                return;
                            }
                            switch (await quickCheck(enteredURL)) {
                                case "passed":
                                    quickInject(enteredURL, res);
                                    break;
                                case "failed":
                                    console.log("quickCheck failed inject"); //send error message to user
                                    await jsonController.setBlockedLinks(JSON.stringify([enteredURL]));
                                    res.status(500).send();
                                    break;
                                case "error":
                                    switch (await hccCheck(enteredURL)) {
                                        case "passed":
                                            console.log("hcc passed inject 2");
                                            let lrId = await jsonController.getLrId(enteredURL);
                                            quickInjectFailed = true;
                                            injectLink(enteredURL, res, lrId);
                                            break;
                                        case "failed":
                                            console.log("hcc failed inject 2"); //send error message to user
                                            await jsonController.setBlockedLinks(JSON.stringify([enteredURL]));
                                            res.status(500).send();
                                            break;
                                        default:
                                            console.log("hcc error inject 2"); //send error message to user
                                            res.status(500).send();
                                            break;
                                    }
                                    break;
                                default:
                                    console.log("should not be here 2");
                                    res.status(500).send();
                                    break;
                            }
                        }
                    } else res.status(500).send();
                } else res.status(500).send();
            } catch (e) {
                console.log(e);
            }
        }
    }

    //use input validation method before entering this method 
    //get the title and desc then compare it to skills.json then show the same "next thing you wanna learn" window
    hccLinkInject = injectLink;

    createLearningResoruces = async function (req, res) {
        var dl = await jsonController.getDiscoveredLinks();
        if (dl.length < 1) return;
        //shuffle to make discovered links less biased towards a single website https://flaviocopes.com/how-to-shuffle-array-javascript/
        dl = dl.sort(() => Math.random() - 0.5);
        console.log("dl = " + dl.length);
        if (dl.length > 50) dl.length = 50; //backhere to inject tons
        console.log("dl = " + dl.length);

        var dlToBeDeleted = [];
        console.log("dl = " + dl.length);
        for (var i = 0; i < dl.length; i++) dlToBeDeleted.push(dl[i].link);
        const bl = await jsonController.getBlockedLinks();
        console.log("dl = " + dl.length);
        console.log("bl = " + bl.length);
        const vl = await jsonController.getVisitedLinks();
        // console.log("vl = " + vl.length);
        var dlTemp = [];

        //* Add each skill in a coursera parent as multiple parents to the same child or don't support coursera at all, instead do udacity, it has reqs

        for (var i = 0; i < dl.length; i++) {
            if (bl.includes(dl[i].link)) {
                dlTemp.push(dl[i].link);
            }
        }

        for (var i = 0; i < dl.length; i++) {
            if (vl.includes(dl[i].link)) {
                dlTemp.push(dl[i].link);
            }
        }

        console.log("dl before = " + dl.length);
        if (dl.length < 1) {
            return res.status(201).send();
        }
        dl = dl.filter(function (el) {
            return dlTemp.indexOf(el.link) < 0;
        });
        console.log("dl after = " + dl.length);
        for (var i = 0; i < dl.length; i++) {
            // for(var i = 0;i<5;i++){
            console.log(dl[i].link);
            if (!dl[i].isChecked) {
                //include whitelisted links
                if (!(dl[i].link.includes("https://www.udemy.com/course/") || dl[i].link.includes("https://www.coursera.org/learn/") ||
                    dl[i].link.includes("https://www.coursera.org/specializations/") || dl[i].link.includes("https://www.udacity.com/course/"))) {
                    switch (await quickCheck(dl[i].link)) {
                        case "passed":
                            dl[i].isChecked = true;
                            break;
                        case "failed":
                            dlTemp.push(dl[i].link);
                            dl[i].isChecked = true;
                            break;
                        case "error":
                            switch (await hccCheck(dl[i].link)) {
                                case "passed":
                                    console.log("hcc passed");
                                    dl[i].isChecked = true;
                                    break;
                                case "failed":
                                    console.log("hcc failed");
                                    dlTemp.push(dl[i].link);
                                    dl[i].isChecked = true;
                                    break;
                                default:
                                    console.log("hcc error");
                                    dl[i].isChecked = false;
                                    break;
                            }
                            break;
                        default:
                            console.log("should not be here");
                            break;
                    }
                } else {
                    dl[i].isChecked = true;
                }
            }
        }

        console.log("dlTemp = " + dlTemp);

        console.log("dl before = " + dl.length);
        if (dl.length < 1) {
            return res.status(201).send();
        }
        dl = dl.filter(function (el) {
            return dlTemp.indexOf(el.link) < 0;
        });
        console.log("dl after = " + dl.length);

        //store dlTemp in a json file, so that we don't crawl unnecessarily into them again - inside the python file to prevent storing in the first place
        if (dlTemp.length > 0)
            await jsonController.setBlockedLinks(JSON.stringify(dlTemp));

        //visit links then delete them___________
        // for(var i = 0;i<5;i++){
        for (var i = 0; i < dl.length; i++) {
            if (!dl[i].isVisited) {
                await injectLink(dl[i].link, res, null);
                dl[i].isVisited = true;
            }
        }

        // destroy what's inside dlToBeDeleted from discoveredLinks
        await jsonController.deleteDiscoveredLinks(JSON.stringify(dlToBeDeleted));
        
        //clear blocked list from links longer than 50 characters
        if (res) {
            var beep = require('beepbeep');
            beep(4, 1000);
            res.status(201).send();
        }
    }

}

async function quickInject(link, res) {
    const pShell = require('python-shell').PythonShell;
    let lrId = await jsonController.getLrId(link);
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ, //might cause issues
        args: [link]
    };
    try {
        pShell.run('QuickScrape.py', options, function (err, results) {
            if (err) throw err;
            let titleDesc = results;
            //accumulate an object until it's filled with all the elements needed
            console.log("titleDesc = " + titleDesc);
            if (titleDesc != "Failed") {
                let lrObj = { "title": JSON.parse(JSON.stringify(titleDesc))[0][0], "description": JSON.parse(JSON.stringify(titleDesc))[0][1], "link": link, "rating": 2.5, "date": new Date(), "lrid": lrId };
                predController.concludedSkill(titleDesc, res, lrObj);
                injectLink(link, res, lrId);
            } else {
                this.quickInjectFailed = true;
                injectLink(link, res, lrId);
            }
        });
    } catch (e) {
        this.quickInjectFailed = true;
        injectLink(link, res, lrId);
        console.log(e);
    }
}


async function injectLink(learningLink, res, lrId) {
    if (!learningLink) {
        return res.send({ success: false, message: '' });
    }
    if (!lrId) {
        console.log("lrId is null");
        lrId = await jsonController.getLrId(learningLink);
    }
    let supportedType = "";
    if (learningLink.includes("www.udemy.com")) {
        supportedType = "udemy";
    } else if (learningLink.includes("www.coursera.org")) {
        supportedType = "coursera";
    } else if (learningLink.includes("www.udacity.com")) {
        supportedType = "udacity";
    } else if (learningLink.includes("stackoverflow.com")) {
        supportedType = "stackoverflow";
    }


    let courseTitle = "";
    let courseDesc = "";
    let desiredLink = "";
    let desiredLinks = [];

    let count = 0;
    let slashIndices = []
    for (i = 0; i < learningLink.length; i++) {
        if (learningLink.charAt(i) == "/") {
            count++;
            slashIndices.push(i);
        }
    }
    if (learningLink.includes("http") || learningLink.includes("https")) {
        if (count > 3) {
            desiredLink = learningLink.slice(0, learningLink.lastIndexOf("/", slashIndices[slashIndices.length - 2]) + 1);
        }
    } else {
        if (count > 1) {
            desiredLink = learningLink.slice(0, learningLink.lastIndexOf("/", slashIndices[slashIndices.length - 2]) + 1);
        }
    }
    console.log("learningLink = " + learningLink);
    console.log("desiredLink = " + desiredLink);
    console.log("Processing...\n");
    try {
        const crawler = await HCCrawler.launch({
            maxConcurrency: 1,
            // userAgent:
            //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
            evaluatePage: (() => ({
                courseTitle: document.title,
                //document.querySelectorAll("head > meta[name='description']")[0].content;
                courseDesc: $("meta[name='description']").attr('content'),
                htmlPage: document.documentElement.outerHTML,

                childrenUdemy: Array.from(document.querySelectorAll("div.ud-component--course-landing-page-udlite--requirements > div > ul > li > div > div[class='udlite-block-list-item-content']")).map(topic => {
                    return topic.innerHTML;
                }),
                childrenCoursera: Array.from(document.querySelectorAll("._1q9sh65")).map(topic => {
                    return topic.innerHTML;
                }),
                childrenUdacity: Array.from(document.querySelectorAll(".degree-info-columns_columnList__D-UoB")).map(topic => { //go down in levels
                    return topic.innerHTML;
                }),
                childrenStackOverFlow: $("meta[name='twitter:description']").attr('content'),
            })),
            //check if title or desc are null and change that to ""
            //support stack overflow using:
            //<meta name="twitter:description" property="og:description" itemprop="description" content="In NLP, stop-words removal is a typical pre-processing step. And it is typically done in an empirical way based on what we think stop-words should be.
            //But in my opinion, we should generalize the c..."> //remove the 3 dots if they exist

            // Function to be called with evaluated desiredLinks from browsers
            onSuccess: (result => {
                courseTitle = result.result.courseTitle;
                courseDesc = result.result.courseDesc;
                console.log("courseDesc:____________________________________________________");
                console.log("courseDesc: " + courseDesc);
                console.log("courseTitle: " + courseTitle);
                const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                const expressionHTTP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                courseTitle = courseTitle.replace(/[^a-z0-9 ]/gi, "");
                courseTitle = courseTitle.replace(/\s+/g, ' ').trim();
                courseTitle = courseTitle.replace(expressionHTTP, "");
                courseTitle = courseTitle.replace(expression, "");
                if(courseDesc){
                    courseDesc = courseDesc.replace(/[^a-z0-9 ]/gi, "");
                    courseDesc = courseDesc.replace(/\s+/g, ' ').trim();
                    courseDesc = courseDesc.replace(expressionHTTP, "");
                    courseDesc = courseDesc.replace(expression, "");
                }
                console.log("courseDesc: " + courseDesc);
                let linkHtml = result.result.htmlPage;
                if (!courseTitle) courseTitle = "";
                if (!courseDesc) courseDesc = "";
                if (!linkHtml) linkHtml = "";

                let skillElement;
                switch (supportedType) {
                    case "":
                        break;
                    case "udemy":
                        skillElement = { "parent": courseTitle, "children": result.result.childrenUdemy };
                        break;
                    case "coursera":
                        skillElement = { "parent": String(result.result.childrenCoursera), "children": courseTitle };
                        break;
                    case "udacity":
                        var children = String(result.result.childrenUdacity);
                        children = children.substr(children.indexOf("Prerequisites</h6><h5>") + "Prerequisites</h6><h5>".length);
                        children = children.substr(0, children.indexOf("</h5><button class="));
                        skillElement = { "parent": courseTitle, "children": [children] };
                        break;
                    case "stackoverflow":
                        var children = String(result.result.childrenStackOverFlow);
                        if (children.length > 197) children = children.slice(0, 197);
                        courseDesc = children;
                        console.log("sof: " + children);
                        skillElement = { "parent": courseTitle, "children": [children] };
                        break;
                    default:
                        break;
                }
                console.log("skillElement: " + skillElement);

                websiteType = "Article";

                //What needs to be done is compare frequency in the html file to decide the website's type, then we append the title, description, link and type into the existing learningResources.json
                var courseCount = (linkHtml.match(/course/g) || []).length + (linkHtml.match(/courses/g) || []).length + (linkHtml.match(/online course/g) || []).length;
                var articleCount = (linkHtml.match(/article/g) || []).length + (linkHtml.match(/articles/g) || []).length + (linkHtml.match(/paper/g) || []).length + (linkHtml.match(/essay/g) || []).length + (linkHtml.match(/report/g) || []).length + (linkHtml.match(/story/g) || []).length;
                var podcastCount = (linkHtml.match(/podcast/g) || []).length + (linkHtml.match(/podcasts/g) || []).length + (linkHtml.match(/story/g) || []).length + (linkHtml.match(/commentary/g) || []).length;
                var questionCount = (linkHtml.match(/question/g) || []).length + (linkHtml.match(/answer/g) || []).length + (linkHtml.match(/answers/g) || []).length + (linkHtml.match(/questions/g) || []).length + (linkHtml.match(/help/g) || []).length;
                var forumCount = (linkHtml.match(/forum/g) || []).length + (linkHtml.match(/forums/g) || []).length + (linkHtml.match(/discussion/g) || []).length + (linkHtml.match(/discussions/g) || []).length + (linkHtml.match(/thread/g) || []).length + (linkHtml.match(/threads/g) || []).length + (linkHtml.match(/question/g) || []).length + (linkHtml.match(/help/g) || []).length;
                var videoCount = (linkHtml.match(/video/g) || []).length + (linkHtml.match(/videos/g) || []).length + (linkHtml.match(/watch/g) || []).length;
                var bookCount = (linkHtml.match(/book/g) || []).length + (linkHtml.match(/books/g) || []).length + (linkHtml.match(/pdf/g) || []).length;

                console.log("finished counting website type");
                var siteType = Math.max(courseCount, articleCount, podcastCount, questionCount, videoCount, bookCount, forumCount);
                switch (siteType) {
                    case courseCount:
                        websiteType = "Online Course";
                        break;
                    case articleCount:
                        websiteType = "Article";
                        break;
                    case podcastCount:
                        websiteType = "Podcast";
                        break;
                    case questionCount:
                        websiteType = "Questions & Answers";
                        break;
                    case forumCount:
                        websiteType = "Forum";
                        break;
                    case videoCount:
                        websiteType = "Video";
                        break;
                    case bookCount:
                        websiteType = "Book";
                        break;
                    default:
                        websiteType = "Article";
                        break;
                }
                console.log("websiteType: " + websiteType);

                var beginnerCount = 5 + (linkHtml.match(/beginner/g) || []).length + (linkHtml.match(/beginners/g) || []).length +
                    (linkHtml.match(/easy/g) || []).length + (linkHtml.match(/newbie/g) || []).length + (linkHtml.match(/novice/g) || []).length;
                (linkHtml.match(/rookie/g) || []).length + (linkHtml.match(/basic/g) || []).length + (linkHtml.match(/newb/g) || []).length +
                    (linkHtml.match(/fundamentals/g) || []).length + (linkHtml.match(/fundamental/g) || []).length + (linkHtml.match(/introduction/g) || []).length;
                console.log("beginnerCount: " + beginnerCount);

                var intermediateCount = (linkHtml.match(/intermediate/g) || []).length + (linkHtml.match(/intermediates/g) || []).length + (linkHtml.match(/mediocre/g) || []).length +
                    (linkHtml.match(/experience/g) || []).length + (linkHtml.match(/excellent/g) || []).length + (linkHtml.match(/experienced/g) || []).length +
                    (linkHtml.match(/latest/g) || []).length + (linkHtml.match(/understanding/g) || []).length;
                console.log("intermediateCount: " + intermediateCount);

                var advancedCount = (linkHtml.match(/advanced/g) || []).length + (linkHtml.match(/professional/g) || []).length + (linkHtml.match(/cutting-edge/g) || []).length +
                    (linkHtml.match(/expert/g) || []).length + (linkHtml.match(/experienced/g) || []).length + (linkHtml.match(/exceptional/g) || []).length +
                    (linkHtml.match(/extreme/g) || []).length + (linkHtml.match(/excellent/g) || []).length + (linkHtml.match(/experience/g) || []).length +
                    (linkHtml.match(/latest/g) || []).length;
                console.log("advancedCount: " + advancedCount);

                var diffType = Math.max(beginnerCount, intermediateCount, advancedCount);
                var difficultyType = "Beginner";
                switch (diffType) {
                    case beginnerCount:
                        difficultyType = "Beginner";
                        break;
                    case intermediateCount:
                        difficultyType = "Intermediate";
                        break;
                    case advancedCount:
                        difficultyType = "Advanced";
                        break;
                    default:
                        difficultyType = "Beginner";
                        break;
                }
                console.log("difficultyType: " + difficultyType);

                console.log("title: " + courseTitle);
                console.log("desc: " + courseDesc);

                let links = `${result.links}`.split(",");
                if (desiredLink != "" && links != null) {
                    for (i = 0; i < links.length; i++) {
                        if (links[i].includes(desiredLink) && links[i].length != desiredLink.length) {
                            desiredLinks.push({ "link": links[i], "isChecked": false, "isVisited": false });
                        }
                    }
                }
                result.result.urls = desiredLinks;
                console.log(result.result.urls);

                if (desiredLinks.length > 150) desiredLinks.length = 150;

                learningResource = { "title": courseTitle, "description": courseDesc, "link": learningLink, "type": websiteType, "lrId": lrId, "difficulty": difficultyType };
                jsonController.appendResource(JSON.stringify(learningResource), desiredLink, JSON.stringify(desiredLinks));

                if (supportedType != "") jsonController.appendSkill(JSON.stringify(skillElement));

                if (this.quickInjectFailed) {
                    this.quickInjectFailed = false;
                    let lrObj = { "title": courseTitle, "description": courseDesc, "link": learningLink, "rating": 2.5, "date": new Date(), "lrid": lrId };
                    predController.concludedSkill(courseTitle + "," + courseDesc, res, lrObj);
                }
            }),
        });
        await crawler.queue({
            url: learningLink,
            waitUntil: 'networkidle0',
            delay: 1500,
            device: 'Nexus 7',
        });
        await crawler.onIdle(); // Resolved when no queue is left
        await crawler.close(); // Close the crawler
    } catch (e) {
        console.log(e);
    }
}

async function quickCheck(link) {
    let { PythonShell } = require('python-shell');

    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ, //might cause issues
        args: [link]
    };
    try {
        const { success, err = '', results } = await new Promise(
            (resolve, reject) => {
                PythonShell.run('QuickCheck.py', options,
                    function (err, results) {
                        if (err) {
                            reject({ success: false, err });
                        }
                        // console.log('PythonShell results: %j', results);
                        resolve({ success: true, results });
                    }
                );
            }
        );
        console.log("quickCheck results: " + results);
        return String(results);
    } catch (e) {
        console.log(e);
        return "error";
    }
}

async function hccCheck(link) {
    var title = "";
    var description = "";
    try {
        console.log("hccCheck");
        const crawler = await HCCrawler.launch({
            maxConcurrency: 1,
            evaluatePage: (() => ({
                title: document.title,
                description: $("meta[name='description']").attr('content'),
            })),
            onSuccess: (result => {
                title = String(result.result.title);
                description = String(result.result.description);
            }),
        });
        await crawler.queue({
            url: link,
            waitUntil: 'networkidle0',
            delay: 500,
            device: 'Nexus 7',
        });
        await crawler.onIdle(); // Resolved when no queue is left
        await crawler.close(); // Close the crawler

        const skillsData = await jsonController.getSkillsData();
        var ti = title.split(" ");
        var desc = description.split(" ");
        for (var i = 0; i < skillsData.length; i++) {
            if (title.includes(" " + skillsData[i] + " ") || description.includes(" " + skillsData[i] + " ")) {
                console.log("title: " + title);
                console.log("description: " + description);
                console.log("skillsData[" + i + "] = " + skillsData[i]);
                return "passed";
            }
            for (var j = 0; j < ti.length; j++) {
                if (skillsData[i].includes(" " + ti[j] + " ") || skillsData[i] == ti[j]) {
                    console.log("title: " + ti[j]);
                    console.log("skillsData[" + i + "] = " + skillsData[i]);
                    return "passed";
                }
            }
            for (var k = 0; k < desc.length; k++) {
                if (skillsData[i].includes(" " + desc[k] + " ") || skillsData[i] == desc[k]) {
                    console.log("description: " + desc[k]);
                    console.log("skillsData[" + i + "] = " + skillsData[i]);
                    return "passed";
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
    console.log("title: " + title);
    console.log("description: " + description);
    return "failed";
}

module.exports.injector = new Injector();