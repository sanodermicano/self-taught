require("dotenv").config();
const db = require('../models/db');
const jsonController = require('./jsonOps');
const bcrypt = require('bcrypt');
var HashMap = require('hashmap');

// https://www.npmjs.com/package/hashmap
var usersRecMap = new HashMap();
var nonRegUsersMap = new HashMap();
let learningResources = ["emptyemptyemptyempty"]; //bye bye

//backhere the current global variables are trash for non-registered
//when clicking on a link or the user changes the rating of an existing link, add it to ratings.json and initiate collaborativeBasedFiltering
//OPTIMIZATION store visited links in the ratings.json file 

exports.recommend = function (req, res) {
    try {
        console.log(req.body);
        const { userid, email } = req.body;
        let SQLID = -1;
        if(email!=null && userid!=null){
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID recommend: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), userid)) {
                    return res.status(500).send();
                } else{
                    const page = parseInt(req.query.page);
                    const limit = parseInt(req.query.limit);
                    console.log("page = " + page + ", limit = " + limit);
                    const startIndex = (page - 1) * limit;
                    const endIndex = page * limit;
            
                    const result = {};
                    console.log("startIndex = " + startIndex + ", endIndex = " + endIndex);
            
                    let skills = req.body['skillsListBackup[]'];
                    let prevSkills;
                    if (SQLID > -1) {
                        prevSkills = usersRecMap.get(SQLID + "prevSkills");
                    }
                    console.log("prevSkills: " + String(prevSkills));
                    console.log("skills: " + String(skills));

                    if (String(prevSkills) != String(skills)) {
                        console.log("prevSkills != skills");
                        if (SQLID > -1 && usersRecMap.get(SQLID + "orig")!=null) {
                            usersRecMap.set(SQLID + "prevSkills", skills);
                            recommendSkill(skills, SQLID, res, result, page, limit); 
                        } else {
                            if(SQLID < 0){
                                //store prev skills for nonregistered users somewhere
                            }
                            searchSkill(skills, res, result, page, limit); 
                        }
                    } else {
                        result.results = usersRecMap.get(SQLID + "temp").slice(startIndex, endIndex);
                        result.allPages = Math.round(usersRecMap.get(SQLID + "temp").length / limit);
                        if (endIndex < usersRecMap.get(SQLID + "temp").length) {
                            console.log("endIndex<usersRecMap.get("+SQLID+" +\"temp\").length");
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
                        // console.log("skills final: " + skills);
                        // console.log("result final: " + JSON.stringify(result));
                        res.send({ success: true, message: result });
                    }
                    // res.send({success: true, message: learningResources});
                }
            });
        }else{
            console.log("both email and userid are null");
        }
        //______________________________________________________
    } catch (e) {
        console.log(e);
    }
};

async function searchSkill(skills, res, result, page, limit) {
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
            // console.log(results);
            learningResources = results; //if didn't work use stringify
            result.results = learningResources[0].slice(0, limit);

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            result.allPages = Math.round(learningResources[0].length / limit);
            if (endIndex < learningResources[0].length) {
                console.log("endIndex<learningResources.length");
                result.next = {
                    page: page + 1,
                    limit: limit
                };
            }
            if (startIndex > 0) {
                console.log("startIndex>0 (2)");
                result.previous = {
                    page: page - 1,
                    limit: limit
                };
            }
            console.log("searchSkill res.send");
            res.send({ success: true, message: result });
            // inputChoice();
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
        if(uEmail){
            console.log("oh uEmail");
            email = uEmail;
            userid = null;
        }else{
            console.log("oh shoot");
            if(next) return next();
            return;
        }
    }else{
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
        if(userid){
            if (!await bcrypt.compare(SQLID.toString(), userid)) {
                return res.status(500).send();
            } 
        }
        db.util.query('SELECT * FROM visited WHERE userid = ?', [SQLID], async function (error, result) {
            if (!result) {
                console.log("not logged in");
            } else {
                userObj = JSON.stringify(result);
                usersRecMap.set(SQLID + "prevSkills", null);
                // usersRecMap.set(SQLID + "orig", []);
                // usersRecMap.set(SQLID + "temp", []);
                console.log("userObj 2: " + userObj.length);
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
                    usersRecMap.set(SQLID + "orig", results[0]);
                    console.log("saved in hashmap (use the saved json file, if it doesn\'t exist use collaborativeBasedFiltering): " 
                    + usersRecMap.get(SQLID + "orig").length);
                });
            }
            if(next) next();
        });
        
    });
    } catch (e) {
        console.log(e)
        if(next) next();
    }
}

async function recommendSkill(skills, SQLID, res, result, page, limit) {
    const pShell = require('python-shell').PythonShell;
    // console.log("recommendSkill hashmap: " + usersRecMap.get(SQLID + "orig").length);
    //await save usersRecMap.get(userObj.userid + "orig") in a json file
    console.log("SQLID mhm? " + SQLID);
    await jsonController.writeJSON(usersRecMap.get(SQLID + "orig"), "users/rec"+SQLID).then((d) => d)
        .catch((err) => console.error('writeJSON() failed', err));
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [JSON.stringify({"skills": skills, "id": SQLID})]
    };
    try {
        pShell.run('recommendSkill.py', options, function (err, results) {
            if (err) throw err;
            usersRecMap.set(SQLID + "temp", results[0]);
            result.results = usersRecMap.get(SQLID + "temp").slice(0, limit); //uncomment
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            console.log(usersRecMap.get(SQLID + "temp").length);
            result.allPages = Math.round(usersRecMap.get(SQLID + "temp").length / limit);
            if (endIndex < usersRecMap.get(SQLID + "temp").length) {
                console.log("endIndex<usersRecMap.get("+SQLID+" + \"temp\").length");
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