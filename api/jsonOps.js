require("dotenv").config();
const recController = require('../api/recommender');
const mdb = require('../models/mongo');

exports.getSkills = async function (req, res, next) {
    req.skills = await getSkills();
    console.log("next getSkills");
    return next();
};

exports.getSkillsData = getSkills;

async function getSkills() {
    try {
        let skills = JSON.parse(JSON.stringify(await mdb.read("self-taught-stb", "skills", "skills")));
        return skills['skills'];
    } catch (e) {
        console.log(e);
        return '';
    }
}

exports.getLrId = async function (learningLink = "") {
    var len = 0;
    try {
        let data = await mdb.readAll("self-taught-lr", "learning-resources");
        console.log("getLrId: " + data.length);
        if (learningLink != "") {
            let lr = data.filter(lr => lr.link == learningLink)[0];
            console.log("lr = " + JSON.stringify(lr));
            if (lr) {
                len = lr.lrId;
            } else {
                len = Object.keys(data).length;
            }
        } else {
            len = Object.keys(data).length;
        }
    } catch (err) {
        console.error("err: " + err);
        return len;
    }
    console.log("len = " + len);
    return len;
};
exports.getDiscoveredLinks = async function () {
    try {
        let data = await mdb.readAll("self-taught-injector", "discoveredLinks");
        console.log("getDiscoveredLinks: " + data.length);
        return data;
    } catch (err) {
        console.error("err: " + err);
        return null;
    }
};
exports.getBlockedLinks = getBlockedLinks;

async function getBlockedLinks() {
    try {
        let data = JSON.parse(JSON.stringify(await mdb.read("self-taught-injector", "blockedLinks", "blockedLinks")));
        console.log("getBlockedLinks: " + data['blockedLinks'].length);
        return data['blockedLinks'];
    } catch (err) {
        console.error("err: " + err);
        return null;
    }
};

exports.getVisitedLinks = async function () {
    try {
        let data = await mdb.readAll("self-taught-lr", "learning-resources");
        let sData = []
        for (var i = 0; i < data.length; i++) {
            sData.push(data[i].link);
        }
        console.log("getVisitedLinks: " + sData.length);
        return sData;
    } catch (err) {
        console.error("err: " + err);
        return null;
    }
};
exports.deleteBlockedLinks = async function (req, res) {
    let data = [];
    try {
        let bData = await mdb.readAll("self-taught-injector", "blockedLinks");
        data = JSON.parse(JSON.stringify(bData[0]['blockedLinks']));
        var delData = [];
        console.log("delData before = " + delData.length);
        for (var i = 0; i < data.length; i++) {
            if (data[i].length > 70) {
                delData.push(data[i]);
            }
        }
        console.log("delData after = " + delData.length);
        console.log("data before = " + data.length);
        data = data.filter(function (el) {
            return delData.indexOf(el) < 0;
        });
        console.log("data after = " + data.length);
        
        await mdb.destroy("self-taught-injector", "blockedLinks", "blockedLinks");
        await mdb.create("self-taught-injector", "blockedLinks", "blockedLinks", data);
        if (res) res.status(201).send();
    } catch (err) {
        console.error("err: " + err);
        if (res) res.status(500).send();
    }
};

exports.setBlockedLinks = async function (links) {
    // appendBlocked.py
    let l = JSON.parse(links);
    for (var i = 0; i < l.length; i++) {
        if (!await mdb.existsInArray("self-taught-injector", "blockedLinks", "blockedLinks", l[i])) {
            await mdb.updateArray("self-taught-injector", "blockedLinks", "blockedLinks", l[i]);
        }
    }
    console.log("done setBlockedLinks");
};

exports.appendResource = async function (newResource, desiredLink = "", desiredLinks) {
    // appendJSON.py
    const nr = JSON.parse(newResource);
    await mdb.insertIfNotFound("self-taught-lr", "learning-resources", "lrId", nr.lrId, nr); //6097891f6f4bbd44a7d0e043 //
    if (desiredLink != "") appendDiscoveredLinks(desiredLinks);
    console.log("done appendResource");
};
exports.appendSkill = async function (skillElement) {
    // appendSkill.py
    const se = JSON.parse(skillElement);
    if (!await mdb.insertIfNotFound("self-taught-stb", "raw-data", "parent", se.parent, se))
        await mdb.insertIfNotFound("self-taught-stb", "raw-data", "children", se.children, se); //609606cd015dca68bde02b09
    console.log("done appendSkill");
};

async function appendDiscoveredLinks(newLinks) {
    // appendLinks.py
    let nl = JSON.parse(newLinks);
    //filter out from blocked list
    var nlTemp = [];
    const bl = await getBlockedLinks();
    for (var i = 0; i < nl.length; i++) {
        if (bl.includes(nl[i].link)) {
            nlTemp.push(nl[i].link);
        }
    }
    console.log("nl before = " + nl.length);
    nl = nl.filter(function (el) {
        return nlTemp.indexOf(el.link) < 0;
    });
    console.log("nl after = " + nl.length);
    for (var i = 0; i < nl.length; i++) {
        await mdb.insertIfNotFound("self-taught-injector", "discoveredLinks", "link", nl[i]['link'], nl[i]);
    }
    console.log("done appendDiscoveredLinks");
}

exports.appendRating = async function (newRating, req = null, uEmail = "") {
    //appendRating.py
    const nr = JSON.parse(newRating);
    if (!await mdb.doubleExists("self-taught-recommender", "ratings", "userId", nr.userId, "lrId", nr.lrId)){
        await mdb.createAtRoot("self-taught-recommender", "ratings", nr);
        recController.collaborativeBasedFiltering(req, null, null, uEmail);
    }
    console.log("done appendRating");
}

exports.updateRating = async function (newRating, req = null, uEmail = "") {
    //updateRating.py
    const nr = JSON.parse(newRating);
    if (await mdb.doubleUpdate("self-taught-recommender", "ratings", "userId", nr.userId, "lrId", nr.lrId, "rating", parseFloat(nr.rating))){
        recController.collaborativeBasedFiltering(req, null, null, uEmail);
    }
    console.log("done updateRating");
}

exports.writeJSON = writeJson;

async function writeJson(data, fileName, linkInjector = false) {
    const fs = require('fs').promises;
    await fs.open('./tmp/' + fileName + '.json', 'w');

    //garbage collection warning
    const file = await fs.writeFile('./tmp/' + fileName + '.json', JSON.stringify(data)).catch((err) => console.error("failed to write file", err));
}

exports.exportAllData = async function (pyParentsChildrenContainer, newFoundCourses) {
    await writeJson(pyParentsChildrenContainer, "rawData").then((d) => d)
        .catch((err) => console.error('writeJson() failed', err));

    await writeJson(newFoundCourses, "learningResources").then((d) => d)
        .catch((err) => console.error('writeJson() failed', err));
};