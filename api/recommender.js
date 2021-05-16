require("dotenv").config();
const db = require('../models/MySQL').mySQL;
const mdb = require('../models/MongoDb').mongoDb;
const bcrypt = require('bcrypt');
const HashMap = require('hashmap');

// https://www.npmjs.com/package/hashmap
var usersMap = new HashMap();

class Recommender {
    constructor() {
        pagination.bind(this);
        searchSkill.bind(this);
        recommendSkill.bind(this);
     }

    //methods

    cleanUser = function (req, res) {
        try {
            const { userid, email, uniqueID } = req.body;
            console.log("cleanUser");
            let SQLID = -1;
            if (uniqueID) {
                console.log("cleaned not logged in");
                usersMap.delete(uniqueID + "prevSkills");
                usersMap.delete(uniqueID + "prevRanges");
                usersMap.delete(uniqueID + "prevLRType");
                usersMap.delete(uniqueID + "orig");
                usersMap.delete(uniqueID + "temp");
            } else {
                db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                    console.log("userid: " + userid);
                    SQLID = results[0].id;
                    console.log("SQLID recommend CLEAN: " + SQLID);
                    if (!await bcrypt.compare(SQLID.toString(), userid)) {
                        return res.status(500).send();
                    } else {
                        console.log("cleaned logged in");
                        usersMap.delete(SQLID + "prevSkills");
                        usersMap.delete(SQLID + "prevRanges");
                        usersMap.delete(SQLID + "prevLRType");
                        usersMap.delete(SQLID + "orig");
                        usersMap.delete(SQLID + "temp");
                    }
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    recommend = function (req, res) {
        try {
            console.log(req.body);
            const { userid, email, uniqueID } = req.body;
            let SQLID = -1;
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const result = {};
            console.log("page = " + page + ", limit = " + limit);
            console.log("startIndex = " + startIndex + ", endIndex = " + endIndex);

            let skills = req.body['skillsListFiltered[]'];
            let ranges = req.body['rangesListFiltered[]'];
            //crash prevention
            if (typeof skills !== "string"){
                ranges = ranges.slice(0, skills.length);
                for(var i = ranges.length;i<skills.length;i++)
                    ranges.push(1);
            }
            let LRType = req.body['learningResourceType']; //might make prevLRType and do filteration on Python
            console.log("LRType: " + LRType);

            if (email != null && userid != null && email != '' && userid != '') {
                db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                    console.log("userid: " + userid);
                    SQLID = results[0].id;
                    console.log("SQLID recommend: " + SQLID);
                    if (!await bcrypt.compare(SQLID.toString(), userid)) {
                        return res.status(500).send();
                    } else {
                        let prevSkills = usersMap.get(SQLID + "prevSkills");
                        let prevRanges = usersMap.get(SQLID + "prevRanges");
                        let prevLRType = usersMap.get(SQLID + "prevLRType");

                        console.log("prevSkills 1: " + String(prevSkills));
                        console.log("prevRanges 1: " + String(prevRanges));
                        console.log("prevLRType 1: " + String(prevLRType));
                        console.log("skills: " + String(skills));
                        console.log("ranges: " + String(ranges));
                        const hashKey = String(SQLID);

                        
                        if (String(prevSkills) != String(skills) || String(prevRanges) != String(ranges) || String(prevLRType) != String(LRType)) {
                            console.log("prevSkills != skills");
                            if (await mdb.exists("self-taught-recommender", "priority", "rec" + SQLID)) {
                                usersMap.set(SQLID + "orig", await mdb.read("self-taught-recommender", "priority", "rec" + SQLID));
                            }
                            if (SQLID > -1 && usersMap.get(SQLID + "orig") != null) {
                                usersMap.set(SQLID + "prevSkills", skills);
                                usersMap.set(SQLID + "prevRanges", ranges);
                                usersMap.set(SQLID + "prevLRType", LRType);
                                recommendSkill(skills, ranges, LRType, SQLID, res, result, page, limit);
                            } else {
                                searchSkill(skills, ranges, LRType, hashKey, res, result, page, limit);
                            }
                        } else {
                            console.log("uhm pagination?");
                            pagination(res, result, page, limit, hashKey, startIndex, endIndex);
                        }
                    }
                });
            } else {
                console.log("both email and userid are null");
                if (!uniqueID) return;
                const hashKey = String(uniqueID);
                let prevSkills = usersMap.get(uniqueID + "prevSkills");
                let prevRanges = usersMap.get(uniqueID + "prevRanges");
                let prevLRType = usersMap.get(uniqueID + "prevLRType");
                console.log("prevSkills 2: " + String(prevSkills));
                console.log("prevRanges 2: " + String(prevRanges));
                console.log("prevLRType 2: " + String(prevLRType));
                console.log("skills: " + String(skills));

                if (String(prevSkills) != String(skills) || String(prevRanges) != String(ranges) || String(prevLRType) != String(LRType)) {
                    usersMap.set(uniqueID + "prevSkills", skills);
                    usersMap.set(uniqueID + "prevRanges", ranges);
                    usersMap.set(uniqueID + "prevLRType", LRType);
                    searchSkill(skills, ranges, LRType, hashKey, res, result, page, limit);
                } else {
                    pagination(res, result, page, limit, hashKey, startIndex, endIndex);
                }
            }
            //______________________________________________________
        } catch (e) {
            res.status(500).send();
            console.log(e);
        }
    };

    collaborativeBasedFiltering = function (req, res, next, uEmail = null, isUpdateRating = false) {
        const pShell = require('python-shell').PythonShell;
        let email;
        let userid;
        if (!req.user) {
            if (uEmail) {
                console.log("oh uEmail");
                email = uEmail;
                userid = null;
            } else {
                console.log("oh shoot");
                if (next) return next();
                return;
            }
        } else {
            email = req.user.email;
            userid = req.user.id;
        }

        let SQLID = -1;
        let userObj;
        try {
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID: " + SQLID);
                if (userid) {
                    if (!await bcrypt.compare(SQLID.toString(), userid)) {
                        return res.status(500).send();
                    }
                }
                db.util.query('SELECT title, description, link, rating, lrid FROM visited WHERE userid = ?', [SQLID], async function (error, result) {
                    if (!result) {
                        console.log("not logged in");
                    } else {
                        if (result.length < 5 || !isUpdateRating) { //if less than five learning resources, don't allow running collaborativeBasedFiltering
                            if (result.length % 5 != 0 || result.length < 5) { //for optimization reasons, run collaborativeBasedFiltering every five times a link is added
                                console.log("result.length: " + result.length);
                                if (next) return next();
                                return;
                            }
                        }
                        // title, link and rating
                        userObj = JSON.stringify(result);
                        usersMap.set(SQLID + "prevSkills", null);
                        usersMap.set(SQLID + "prevRanges", null);
                        usersMap.set(SQLID + "prevLRType", null);
                        console.log("userObj 2: " + userObj.length);
                        console.log("userObj 2: " + userObj);
                        let options = {
                            mode: 'json',
                            // pythonPath: process.env.PY_PATH,
                            pythonOptions: ['-u'], // get print results in real-time
                            // scriptPath: process.env.PY_PROJ,
                            scriptPath: '/app/py',
                            args: [userObj]
                        };
                        try {
                            pShell.run('CollaborativeBasedFiltering.py', options, function (err, results) {
                                if (err) throw err;
                                // console.log(results);
                                console.log("SQLID collaborativeBasedFiltering: " + SQLID);
                                usersMap.set(SQLID + "orig", results[0]);
                                mdb.destroy("self-taught-recommender", "priority", "rec" + SQLID);
                                mdb.create("self-taught-recommender", "priority", "rec" + SQLID, usersMap.get(SQLID + "orig"));
                                console.log("saved in hashmap: "
                                    + usersMap.get(SQLID + "orig").length);
                            });
                        } catch (e) {
                            console.log("collaborativeBasedFiltering: " + e);
                        }
                    }
                    if (next) next();
                });

            });
        } catch (e) {
            console.log(e)
            if (next) next();
        }
    }
}

function pagination(res, result, page, limit, hashKey, startIndex, endIndex) {
    result.results = usersMap.get(hashKey + "temp").slice(startIndex, endIndex);
    result.allPages = Math.round(usersMap.get(hashKey + "temp").length / limit);
    // console.log("limit: " + limit);
    // console.log("temp length: " + usersMap.get(hashKey + "temp").length);
    // console.log("page: " + page);
    // console.log("result.allPages: " + result.allPages);
    // console.log("startIndex: " + startIndex);
    // console.log("endIndex: " + endIndex);
    if (endIndex < usersMap.get(hashKey + "temp").length) {
        console.log("endIndex<usersMap.get(" + hashKey + ").length");
        result.next = {
            page: page + 1,
            limit: limit
        };
    }
    if (startIndex > 0) {
        console.log("startIndex>0 (1)");
        result.previous = {
            page: page - 1,
            limit: limit
        };
    }
    res.send({ success: true, message: result });
}

async function searchSkill(skills, ranges, LRType, hashKey, res, result, page, limit) {
    console.log("searchSkill");
    const pShell = require('python-shell').PythonShell;
    const skillsList = Array.isArray(skills) ? skills : [skills];
    const rangesList = Array.isArray(ranges) ? ranges : [ranges];
    let options = {
        mode: 'json',
        // pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        // scriptPath: process.env.PY_PROJ,
        scriptPath: '/app/py',
        args: [JSON.stringify({ "skills": skillsList, "ranges": rangesList, "lrtype": LRType })]
    };
    try {
        pShell.run('SearchSkill.py', options, function (err, results) {
            if (err) throw err;
            // console.log(JSON.stringify({"skills": skillsList, "ranges": rangesList, "lrtype": LRType}));
            usersMap.set(hashKey + "temp", results[0]);
            console.log("results: " + usersMap.get(hashKey + "temp"));
            result.results = usersMap.get(hashKey + "temp").slice(0, limit); //uncomment
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            console.log(usersMap.get(hashKey + "temp").length);
            result.allPages = Math.round(usersMap.get(hashKey + "temp").length / limit);
            if (endIndex < usersMap.get(hashKey + "temp").length) {
                console.log("endIndex<usersMap.get(" + hashKey + " + \"temp\").length");
                result.next = {
                    page: page + 1,
                    limit: limit
                };
            }
            if (startIndex > 0) {
                console.log("startIndex>0 (3)");
                result.previous = {
                    page: page - 1,
                    limit: limit
                };
            }
            console.log("last res.send 1");
            res.send({ success: true, message: result });
        });
    } catch (e) {
        console.log(e)
        res.status(500).send();
    }
}

async function recommendSkill(skills, ranges, LRType, SQLID, res, result, page, limit) {
    const pShell = require('python-shell').PythonShell;
    // console.log("recommendSkill hashmap: " + usersMap.get(SQLID + "orig").length);
    //await save usersMap.get(userObj.userid + "orig") in a json file
    const skillsList = Array.isArray(skills) ? skills : [skills];
    const rangesList = Array.isArray(ranges) ? ranges : [ranges];
    console.log("SQLID mhm? " + SQLID); //609784fee4c8ef50321b01d0
    //figure out a way to update the data only when needed, it doesn't make sense to update the list if the list 
    //of the links is the same as the one before
    // await mdb.destroy("self-taught-recommender", "priority", "rec" + SQLID);
    // await mdb.create("self-taught-recommender", "priority", "rec" + SQLID, usersMap.get(SQLID + "orig"));
    let options = {
        mode: 'json',
        // pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        // scriptPath: process.env.PY_PROJ,
        scriptPath: '/app/py',
        args: [JSON.stringify({ "skills": skillsList, "ranges": rangesList, "id": SQLID, "lrtype": LRType })]
    };
    try {
        pShell.run('RecommendSkill.py', options, function (err, results) {
            if (err) throw err;
            usersMap.set(SQLID + "temp", results[0]);
            result.results = usersMap.get(SQLID + "temp").slice(0, limit); //uncomment
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            console.log(usersMap.get(SQLID + "temp").length);
            result.allPages = Math.round(usersMap.get(SQLID + "temp").length / limit);
            if (endIndex < usersMap.get(SQLID + "temp").length) {
                console.log("endIndex<usersMap.get(" + SQLID + " + \"temp\").length");
                result.next = {
                    page: page + 1,
                    limit: limit
                };
            }
            if (startIndex > 0) {
                console.log("startIndex>0 (3)");
                result.previous = {
                    page: page - 1,
                    limit: limit
                };
            }
            console.log("last res.send 2");
            res.send({ success: true, message: result });
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
}

module.exports.recommender = new Recommender();