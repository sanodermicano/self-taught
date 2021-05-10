require("dotenv").config();
const HCCrawler = require('headless-chrome-crawler');
const jsonOps = require('./jsonOps');

let topicLinks = [];
let courseLinks = [];
let pyParentsChildrenContainer = [];
let newFoundCourses = [];

//this won't be needed soon
exports.buildSkillTree = async function () {
    let topicsIT = ["https://www.udemy.com/topic/web-development/", "https://www.udemy.com/topic/game-design/",
        "https://www.udemy.com/topic/xcode/", "https://www.udemy.com/topic/linux/", "https://www.udemy.com/topic/qt-framework/",
        "https://www.udemy.com/topic/computer-hardware/", "https://www.udemy.com/topic/aws-certification/"];
    // let topicsIT = ["https://www.udemy.com/topic/web-development/"];

    topicLinks.concat(topicsIT);
    for (const topicLink of topicLinks) {
        await getMoreTopics(topicLink);
    }
    //___________________________________________________________
    //uncomment these when done
    for (const topicLink of topicLinks) {
        //will get as many related topics as possible
        await getMoreTopics(topicLink);
    }
    //remove duplicates
    topicLinks = topicLinks.filter(function (item, pos) {
        return topicLinks.indexOf(item) == pos;
    });
    // console.log("topicLinks: " + topicLinks);

    //2
    for (const topicLink of topicLinks) {
        await crawlIntoTopic(topicLink, "?instructional_level=expert&lang=en&sort=popularity");
        await crawlIntoTopic(topicLink, "?instructional_level=intermediate&lang=en&sort=popularity");
        await crawlIntoTopic(topicLink, "?instructional_level=intermediate&p=2&lang=en&sort=popularity");
        //___________________________________________________________
        //comment when done
        // break;
    }
    // //remove duplicates
    courseLinks = courseLinks.filter(function (item, pos) {
        return courseLinks.indexOf(item) == pos;
    });
    // console.log("courseLinks: " + courseLinks);

    //3
    // for (var i = 0; i < 2; i++) {
    for (const courseLink of courseLinks) {
        await crawlIntoCourse(courseLink);
        // await crawlIntoCourse(courseLinks[i]);
        //___________________________________________________________
        //comment when done
        // break;
    }

    //4
    // console.log("pyParentsChildrenContainer: " + JSON.stringify(pyParentsChildrenContainer));
    await jsonOps.exportAllData(pyParentsChildrenContainer, newFoundCourses);
    filterReqs();
}

//for testing purposes
exports.buildTestSkillTree = async function () {
    let topicsIT = ["https://www.udemy.com/topic/web-development/", "https://www.udemy.com/topic/game-design/"];

    // topicLinks.concat(topicsIT);
    topicLinks = topicLinks.concat(topicsIT);
    console.log(topicLinks);
    for (const topicLink of topicLinks) {
        await getMoreTopics(topicLink);
        break;
    }
    for (const topicLink of topicLinks) {
        await getMoreTopics(topicLink);
        break;
    }
    topicLinks = topicLinks.filter(function (item, pos) {
        return topicLinks.indexOf(item) == pos;
    });
    console.log("topicLinks: " + topicLinks);

    //2
    for (const topicLink of topicLinks) {
        await crawlIntoTopic(topicLink, "?instructional_level=expert&lang=en&sort=popularity");
        // await crawlIntoTopic(topicLink, "?instructional_level=intermediate&lang=en&sort=popularity");
        // await crawlIntoTopic(topicLink, "?instructional_level=intermediate&p=2&lang=en&sort=popularity");
        break;
    }
    courseLinks = courseLinks.filter(function (item, pos) {
        return courseLinks.indexOf(item) == pos;
    });
    console.log("courseLinks: " + courseLinks);

    //3
    for (const courseLink of courseLinks) {
        await crawlIntoCourse(courseLink);
        break;
    }

    //4
    console.log("pyParentsChildrenContainer: " + JSON.stringify(pyParentsChildrenContainer));
    await jsonOps.exportAllData(pyParentsChildrenContainer, newFoundCourses);
    filterReqs();
}

async function getMoreTopics(topicLink) {
    console.log("Processing: " + topicLink);

    try {
        const crawler = await HCCrawler.launch({
            maxConcurrency: 1,
            evaluatePage: (() => ({
                topics: Array.from(document.querySelectorAll("a[class ='udlite-heading-md popular-topics-unit--topic-tag--6fHd8']")).map(topic => {
                    return topic.href
                }),
            })),
            onSuccess: (result => {
                topics = result.result.topics;
                topicLinks = topicLinks.concat(topics);
                console.log("Done 1");
            }),
        });
        await crawler.queue({
            url: topicLink,
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
//inside a for each link recursion at the onsuccess function
async function crawlIntoTopic(topicLink, optionsLink) {
    console.log("Processing: " + topicLink);
    try {
        const crawler = await HCCrawler.launch({
            maxConcurrency: 1,
            evaluatePage: (() => ({
                courses: Array.from(document.querySelectorAll("div.course-list--container--3zXPS > div > a[class='udlite-custom-focus-visible browse-course-card--link--3KIkQ']")).map(topic => {
                    return topic.href;
                }),
            })),
            onSuccess: (result => {
                courses = result.result.courses;
                courseLinks = courseLinks.concat(courses);
                console.log("Done 2");
            }),
        });
        await crawler.queue({
            // url: (topicLink + "?instructional_level=intermediate&instructional_level=expert&lang=en&sort=popularity"),
            url: (topicLink + optionsLink),
            waitUntil: 'networkidle0',
            delay: 1500,
            device: 'Nexus 7',
        });
        await crawler.onIdle(); // Resolved when no queue is left
        await crawler.close(); // Close the crawler
    } catch (error) {
        console.log("error: " + error);
    }
}
//inside a for each link recursion at the onsuccess function
async function crawlIntoCourse(courseLink) {
    console.log("Processing: " + courseLink);

    try {
        const crawler = await HCCrawler.launch({
            maxConcurrency: 1,
            evaluatePage: (() => ({
                parent: document.title,
                desc: $("meta[name='description']").attr('content'),
                ///html/body/div[2]/div[3]/div[1]/div[4]/div[6]/div/div/div/div/ul/li[1]/div/div
                children: Array.from(document.querySelectorAll("div.ud-component--course-landing-page-udlite--requirements > div > ul > li > div > div[class='udlite-block-list-item-content']")).map(topic => {
                    return topic.innerHTML;
                }),
            })),
            onSuccess: (result => {
                parent = result.result.parent;
                children = result.result.children;
                desc = result.result.desc;
                var jsonArg = new Object();
                jsonArg.parent = parent;
                jsonArg.children = children;
                pyParentsChildrenContainer.push(jsonArg);
                var jsonArg1 = new Object();
                jsonArg1.title = parent;
                jsonArg1.description = desc;
                jsonArg1.link = courseLink;
                jsonArg1.type = 'Online Course';
                newFoundCourses.push(jsonArg1);
                console.log("Done 3");
            }),
        });
        await crawler.queue({
            url: courseLink,
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

exports.buildTree = async function (req, res, next) {
    console.log("buildTree");
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
    };
    // pShell.run('buildTree.py', options, function (err, results) { //when in nodemon
    try {
        pShell.run('buildTree.py', options, function (err, results) {
            if (err) throw err;
            console.log('Tree building is: ', results);
            pShell.run('cleaningSkillTree.py', options, function (err, results) {
                if (err) throw err;
                console.log("results cleaningSkillTree = " + results);
                if (res) {
                    var beep = require('beepbeep');
                    beep(2, 1000);
                    res.status(201).send();
                }
            });
            // res.status(201).send();
        });
    } catch (e) {
        console.log("e: " + e);
        res.status(500).send();
    }
}

// exports.cleanSkillTree = async function (req, res, next){
//     const pShell = require('python-shell').PythonShell;
//     let options = {
//         mode: 'json',
//         pythonPath: process.env.PY_PATH,
//         pythonOptions: ['-u'], // get print results in real-time
//         scriptPath: process.env.PY_PROJ,
//     };
//     pShell.run('cleaningSkillTree.py', options, function (err, results) {
//         if (err) throw err;
//         console.log("results cleaningSkillTree = " + results);
//         res.status(201).send();
//     });
// }

async function filterReqs() {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
    };
    try {
        pShell.run('buildTree.py', options, function (err, results) {
            if (err) throw err;
            console.log('Tree building is: ', results);
            // inputChoice();
        });
    } catch (e) {
        console.log("e: " + e);
        res.status(500).send();
    }
}