require("dotenv").config();
const db = require('../models/mysql').mySQL;
const bcrypt = require('bcrypt');

class Predictor {
    constructor() { }

    //methods
    predict = async function (newSkill, userid, email, res) {
        let SQLID = 0;
        db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
            try{
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), userid)) {
                    return res.status(500).send();
                } else {
                    console.log("SQLID: " + SQLID + "\nemail: " + email + "\nnewSkill: " + newSkill);
                    const pShell = require('python-shell').PythonShell;
                    let options = {
                        mode: 'json',
                        // pythonPath: process.env.PY_PATH,
                        pythonOptions: ['-u'], // get print results in real-time
                        // scriptPath: process.env.PY_PROJ, //might cause issues
                        scriptPath: '/py', //might cause issues
                        args: [newSkill]
                    };
                    try {
                        pShell.run('predict.py', options, function (err, results) {
                            if (err) throw err;
                            let prediction = JSON.stringify(results);
                            res.send({ success: true, message: prediction });
                        });
                    } catch (e) {
                        console.log("e: " + e);
                        res.status(500).send();
                    }
                }
            } catch (e) {
                console.log("e error in login: " + e);
                res.status(500).send();
            }
        });
    }

    concludedSkill = async function (titleDesc, res, lrObj) {
        console.log("concluded skill");
        const pShell = require('python-shell').PythonShell;
        let options = {
            mode: 'json',
            // pythonPath: process.env.PY_PATH,
            pythonOptions: ['-u'], // get print results in real-time
            // scriptPath: process.env.PY_PROJ, //might cause issues
            scriptPath: '/py', //might cause issues
            args: [titleDesc]
        };
        try {
            pShell.run('concludedSkill.py', options, function (err, results) {
                if (err) throw err;
                let resultedConcludedSkills = results;
                console.log("resultedConcludedSkills = [" + resultedConcludedSkills + "]");
                if (res != null) {
                    if (resultedConcludedSkills != "") {
                        res.send({ success: true, message: resultedConcludedSkills, lrObj: JSON.stringify(lrObj) });
                    } else {
                        res.status(500).send();
                    }
                }
            });
        } catch (e) {
            console.log("e: " + e);
            res.status(500).send();
        }
    }
}

module.exports.predictor = new Predictor();