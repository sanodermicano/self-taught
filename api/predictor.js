require("dotenv").config();

class Predictor {
    constructor(){ }

    //methods
    predict = async function(skill, res) {
        const pShell = require('python-shell').PythonShell;
        let options = {
            mode: 'json',
            pythonPath: process.env.PY_PATH,
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: process.env.PY_PROJ, //might cause issues
            args: [skill]
        };
        try {
            pShell.run('Predict.py', options, function (err, results) {
                if (err) throw err;
                let prediction = JSON.stringify(results);
                res.send({ success: true, message: prediction });
                // inputChoice();
            });
        } catch (e) {
            console.log("e: " + e);
            res.status(500).send();
        }
    }

    concludedSkill = async function(titleDesc, res, lrObj) {
        console.log("concluded skill");
        const pShell = require('python-shell').PythonShell;
        let options = {
            mode: 'json',
            pythonPath: process.env.PY_PATH,
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: process.env.PY_PROJ, //might cause issues
            args: [titleDesc]
        };
        try {
            pShell.run('ConcludedSkill.py', options, function (err, results) {
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