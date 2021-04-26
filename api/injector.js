
require("dotenv").config();
const HCCrawler = require('headless-chrome-crawler');
const predController = require('./predictor');
const jsonController = require('./jsonOps');

let quickInjectFailed = false;

exports.inject = async function (req, res) {
    if (!req.user) {
        res.status(500).send();
    } else {
        try {
            var enteredURL = JSON.stringify(req.body).split("\"")[1];
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
                } else res.status(500).send();
            } else res.status(500).send();
        } catch (e) {
            console.log(e);
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
    pShell.run('quickScrape.py', options, function (err, results) {
        if (err) throw err;
        let titleDesc = results;
        //accumulate an object until it's filled with all the elements needed
        console.log("titleDesc = " + titleDesc);
        if (titleDesc != "Failed") {
            let lrObj = { "title": JSON.parse(JSON.stringify(titleDesc))[0][0], "description": JSON.parse(JSON.stringify(titleDesc))[0][1], "link": link, "rating": 2.5, "date": new Date(), "lrid": lrId };
            predController.concludedSkill(titleDesc, res, lrObj);
            injectLink(link, res, lrId);
        } else {
            quickInjectFailed = true;
            injectLink(link, res, lrId);
        }
    });
}
//use input validation method before entering this method 
//get the title and desc then compare it to skills.json then show the same "next thing you wanna learn" window
exports.hccLinkInject = injectLink;

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
    console.log("desiredLink = " + desiredLink);
    console.log("Processing...\n");

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
        })),
        // Function to be called with evaluated desiredLinks from browsers
        onSuccess: (result => {
            courseTitle = result.result.courseTitle;
            courseDesc = result.result.courseDesc;

            courseHtml = result.result.htmlPage;
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
                default:
                    break;
            }

            websiteType = "Article";

            var courseCount = (courseHtml.match(/course/g) || []).length + (courseHtml.match(/courses/g) || []).length + (courseHtml.match(/online course/g) || []).length;
            var articleCount = (courseHtml.match(/article/g) || []).length + (courseHtml.match(/articles/g) || []).length + (courseHtml.match(/document/g) || []).length + (courseHtml.match(/documents/g) || []).length;
            var podcastCount = (courseHtml.match(/podcast/g) || []).length + (courseHtml.match(/podcasts/g) || []).length;
            var questionCount = (courseHtml.match(/question/g) || []).length + (courseHtml.match(/answer/g) || []).length + (courseHtml.match(/answers/g) || []).length + (courseHtml.match(/questions/g) || []).length;
            var videoCount = (courseHtml.match(/video/g) || []).length + (courseHtml.match(/videos/g) || []).length;
            var bookCount = (courseHtml.match(/book/g) || []).length + (courseHtml.match(/books/g) || []).length + (courseHtml.match(/pdf/g) || []).length;

            var siteType = Math.max(courseCount, articleCount, podcastCount, questionCount, videoCount, bookCount);
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

            console.log("title: " + courseTitle);
            console.log("desc: " + courseDesc);

            let links = `${result.links}`.split(",");
            if (desiredLink != "") {
                for (i = 0; i < links.length; i++) {
                    if (links[i].includes(desiredLink) && links[i].length != desiredLink.length) {
                        desiredLinks.push({ "link": links[i], "isChecked": false, "isVisited": false });
                    }
                }
            }
            result.result.urls = desiredLinks;
            console.log(result.result.urls);

            //skilltree buider plan: check if link if udemy or coursera then add it to rawdata.json, then have a cin command 
            //rst reload skilltree (or periodically), ist initialize skilltree
            learningResource = { "title": courseTitle, "description": courseDesc, "link": learningLink, "type": websiteType, "lrId": lrId };
            jsonController.appendResource(JSON.stringify(learningResource), desiredLink, JSON.stringify(desiredLinks));

            if (supportedType != "") jsonController.appendSkill(JSON.stringify(skillElement));

            if (quickInjectFailed) {
                quickInjectFailed = false;
                if (!courseDesc) courseDesc = "";
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
}

exports.createLearningResoruces = async function (req, res) {
    var dl = await jsonController.getDiscoveredLinks();
    if (dl.length < 1) return;
    if (dl.length > 50) dl.length = 50;

    var dlToBeDeleted = [];
    for (var i = 0; i < dl.length; i++) dlToBeDeleted.push(dl[i].link);
    const bl = await jsonController.getBlockedLinks();
    console.log("bl = " + bl);
    var dlTemp = [];
    //* Add each skill in a coursera parent as multiple parents to the same child or don't support coursera at all, instead do udacity, it has reqs
    //or take from all four of them, Udemy, Coursera, Udacity, Lynda and SkillShare (U U S are best for now)

    for (var i = 0; i < dl.length; i++) {
        if (bl.includes(dl[i].link)) {
            dlTemp.push(dl[i].link);
        }
    }

    console.log("dl before = " + dl.length);
    dl = dl.filter(function (el) {
        return dlTemp.indexOf(el.link) < 0;
    });
    console.log("dl after = " + dl.length);
    for (var i = 0; i < dl.length; i++) {
        // for(var i = 0;i<5;i++){
        console.log(dl[i].link);
        if (!dl[i].isChecked) {
            if (!(dl[i].link.includes("https://www.udemy.com/course/") || dl[i].link.includes("https://www.coursera.org/learn/") || dl[i].link.includes("https://www.coursera.org/specializations/"))) { //include whitelisted links
                //check if the websites is blacklisted!!
                //it's giving me an error anyway
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

    var newDl = await jsonController.getDiscoveredLinks();
    console.log("newDl before = " + newDl.length);
    newDl = newDl.filter(function (el) {
        return dlToBeDeleted.indexOf(el.link) < 0;
    });
    console.log("newDl after = " + newDl.length);

    await jsonController.writeJSON(newDl, "discoveredLinks").then((d) => d)
        .catch((err) => console.error('writeJSON() failed', err));
    //clear blocked list from links longer than 50 characters
    res.status(201).send();
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

    const { success, err = '', results } = await new Promise(
        (resolve, reject) => {
            PythonShell.run('quickCheck.py', options,
                function (err, results) {
                    if (err) {
                        reject({ success: false, err });
                    }

                    console.log('PythonShell results: %j', results);

                    resolve({ success: true, results });
                }
            );
        }
    );
    console.log("quickCheck results: " + results);
    return String(results);
}

async function hccCheck(link) {
    var title = "";
    var description = "";
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
            if (skillsData[i] == ti[j]) {
                console.log("title: " + ti[j]);
                console.log("skillsData[" + i + "] = " + skillsData[i]);
                return "passed";
            }
        }
        for (var k = 0; k < desc.length; k++) {
            if (skillsData[i] == desc[k]) {
                console.log("description: " + desc[k]);
                console.log("skillsData[" + i + "] = " + skillsData[i]);
                return "passed";
            }
        }
    }
    console.log("title: " + title);
    console.log("description: " + description);
    return "failed";
}