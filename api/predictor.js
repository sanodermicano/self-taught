require("dotenv").config();

exports.concludedSkill = async function (titleDesc, res, lrObj) {
    console.log("concluded skill");
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ, //might cause issues
        args: [titleDesc]
    };
    pShell.run('concludedSkill.py', options, function (err, results) {
        if (err) throw err;
        let resultedConcludedSkills = results;
        console.log("resultedConcludedSkills = [" + resultedConcludedSkills + "]");
        if(res!=null){
            if(resultedConcludedSkills != ""){
                res.send({ success: true, message: resultedConcludedSkills, lrObj: JSON.stringify(lrObj) });
            }else{
                res.status(500).send();
            }
        }
    });
}

exports.predict = async function (skill, res) {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ, //might cause issues
        args: [skill]
    };
    pShell.run('predict.py', options, function (err, results) {
        if (err) throw err;
        let prediction = JSON.stringify(results);
        res.send({ success: true, message: prediction });
        // inputChoice();
    });
}