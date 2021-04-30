require("dotenv").config();
const db = require('../models/db');
const jsonController = require('./jsonOps');
const bcrypt = require('bcrypt');
var HashMap = require('hashmap');

// https://www.npmjs.com/package/hashmap
var usersMap = new HashMap();

exports.cleanUser = function(req, res){
    try{
        const { userid, email, uniqueID } = req.body;
        console.log("cleanUser");
        let SQLID = -1;
        if(uniqueID){
            console.log("cleaned not logged in");
            usersMap.delete(uniqueID + "prevSkills");
            usersMap.delete(uniqueID + "orig");
            usersMap.delete(uniqueID + "temp");
        }else{
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID recommend: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), userid)) {
                    return res.status(500).send();
                } else {
                    console.log("cleaned logged in");
                    usersMap.delete(SQLID + "prevSkills");
                    usersMap.delete(SQLID + "orig");
                    usersMap.delete(SQLID + "temp");
                }
            });
        }
    }catch (e) {
        console.log(e);
    }
}

exports.recommend = function (req, res) {
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

        let skills = req.body['skillsListBackup[]'];

        if (email != null && userid != null && email!='' && userid!='') {
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID recommend: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), userid)) {
                    return res.status(500).send();
                } else {
                    let prevSkills = usersMap.get(SQLID + "prevSkills");

                    console.log("prevSkills 1: " + String(prevSkills));
                    console.log("skills: " + String(skills));
                    const hashKey = String(SQLID);
                    if (String(prevSkills) != String(skills)) {
                        console.log("prevSkills != skills");
                        if (SQLID > -1 && usersMap.get(SQLID + "orig") != null) {
                            usersMap.set(SQLID + "prevSkills", skills);
                            recommendSkill(skills, SQLID, res, result, page, limit);
                        } else {
                            searchSkill(skills, hashKey, res, result, page, limit);
                        }
                    } else {
                        pagination(res, result, page, limit, hashKey, startIndex, endIndex);
                    }
                }
            });
        } else {
            console.log("both email and userid are null");
            if(!uniqueID) return;
            const hashKey = String(uniqueID);
            let prevSkills = usersMap.get(uniqueID + "prevSkills");
            console.log("prevSkills 2: " + String(prevSkills));
            console.log("skills: " + String(skills));

            if (String(prevSkills) != String(skills)) {
                usersMap.set(uniqueID + "prevSkills", skills);
                searchSkill(skills, hashKey, res, result, page, limit);
            } else {
                pagination(res, result, page, limit, hashKey, startIndex, endIndex);
            }
        }  
        //______________________________________________________
    } catch (e) {
        console.log(e);
    }
};

function pagination(res, result, page, limit, hashKey, startIndex, endIndex) {
    result.results = usersMap.get(hashKey + "temp").slice(startIndex, endIndex);
    result.allPages = Math.round(usersMap.get(hashKey + "temp").length / limit);
    if (endIndex < usersMap.get(hashKey + "temp").length) {
        console.log("endIndex<usersMap.get("+hashKey+").length");
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

async function searchSkill(skills, hashKey, res, result, page, limit) {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [skills]
    };
    try {
        pShell.run('searchSkill.py', options, function (err, results) {
            if (err) throw err;
            usersMap.set(hashKey + "temp", results[0]);
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
            console.log("last res.send");
            res.send({ success: true, message: result });
        });
    } catch (e) {
        console.log(e)
    }
}

exports.collaborativeBasedFiltering = function (req, res, next, uEmail = null) {
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
            db.util.query('SELECT * FROM visited WHERE userid = ?', [SQLID], async function (error, result) {
                if (!result) {
                    console.log("not logged in");
                } else {
                    if (result.length < 1) {
                        console.log("result.length: " + result.length);
                        if (next) return next();
                        return;
                    }
                    userObj = JSON.stringify(result);
                    usersMap.set(SQLID + "prevSkills", null);
                    // usersMap.set(SQLID + "orig", []);
                    // usersMap.set(SQLID + "temp", []);
                    console.log("userObj 2: " + userObj.length);
                    console.log("userObj 2: " + userObj);
                    let options = {
                        mode: 'json',
                        pythonPath: process.env.PY_PATH,
                        pythonOptions: ['-u'], // get print results in real-time
                        scriptPath: process.env.PY_PROJ,
                        args: [userObj]
                    };
                    pShell.run('collaborativeBasedFiltering.py', options, function (err, results) {
                        if (err) throw err;
                        // console.log(results);
                        console.log("SQLID collaborativeBasedFiltering: " + SQLID);
                        usersMap.set(SQLID + "orig", results[0]);
                        console.log("saved in hashmap (use the saved json file, if it doesn\'t exist use collaborativeBasedFiltering): "
                            + usersMap.get(SQLID + "orig").length);
                    });
                }
                if (next) next();
            });

        });
    } catch (e) {
        console.log(e)
        if (next) next();
    }
}

async function recommendSkill(skills, SQLID, res, result, page, limit) {
    const pShell = require('python-shell').PythonShell;
    // console.log("recommendSkill hashmap: " + usersMap.get(SQLID + "orig").length);
    //await save usersMap.get(userObj.userid + "orig") in a json file
    console.log("SQLID mhm? " + SQLID);
    await jsonController.writeJSON(usersMap.get(SQLID + "orig"), "users/rec" + SQLID).then((d) => d)
        .catch((err) => console.error('writeJSON() failed', err));
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [JSON.stringify({ "skills": skills, "id": SQLID })]
    };
    try {
        pShell.run('recommendSkill.py', options, function (err, results) {
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
            console.log("last res.send");
            res.send({ success: true, message: result });
        });
    } catch (e) {
        console.log(e)
    }
}