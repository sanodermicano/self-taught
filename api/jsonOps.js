require("dotenv").config();
const recController = require('../api/recommender');

exports.getSkills =  async function(req, res, next) {
    req.skills = await getSkills();
    console.log("next getSkills");
    return next();
};

exports.getSkillsData = getSkills;

async function getSkills(){
    var skills = '';
    const readfs = require('fs');
    try {
        const fData = readfs.readFileSync('./tmp/' + 'skills' + '.json');
        skills = JSON.parse(fData);
    } catch (err) {
        console.error("err: " + err);
    }
    return skills;
}

exports.getLrId =  async function(learningLink = "") {
    console.log("getLrId");
    var len = 0;
    const readfs = require('fs');
    try {
        const fData = readfs.readFileSync('./tmp/' + 'learningResources' + '.json');
        let data = JSON.parse(fData);
        if(learningLink!=""){
            let lr = data.filter(lr => lr.link == learningLink)[0];
            console.log("lr = " + JSON.stringify(lr));
            if(lr){
               len = lr.lrId;
            }else{
                len = Object.keys(data).length;
            }
        }else{
            len = Object.keys(data).length;
        }
    } catch (err) {
        console.error("err: " + err);
        return len;
    }
    console.log("len = " + len);
    return len;
};
exports.getDiscoveredLinks =  async function() {
    console.log("getDiscoveredLinks");
    const readfs = require('fs');
    try {
        const fData = readfs.readFileSync('./tmp/' + 'discoveredLinks' + '.json');
        let data = JSON.parse(fData);
        // console.log(data);
        return data;
    } catch (err) {
        console.error("err: " + err);
        return null;
    }
};
exports.getBlockedLinks =  async function() {
    console.log("getBlockedLinks");
    const readfs = require('fs');
    try {
        const fData = readfs.readFileSync('./tmp/' + 'blockedLinks' + '.json');
        let data = JSON.parse(fData);
        // console.log(data);
        return data;
    } catch (err) {
        console.error("err: " + err);
        return null;
    }
};

exports.getVisitedLinks =  async function() {
    console.log("getVisitedLinks");
    const readfs = require('fs');
    try {
        const fData = readfs.readFileSync('./tmp/' + 'learningResources' + '.json');
        let data = JSON.parse(fData);
        let sData = []
        for(var i = 0; i<data.length;i++){
            sData.push(data[i].link);
        }
        // console.log(sData.length);
        // console.log(sData);
        return sData;
    } catch (err) {
        console.error("err: " + err);
        return null;
    }
};

exports.deleteBlockedLinks =  async function(req, res) {
    console.log("deleteBlockedLinks");
    const readfs = require('fs');
    let data = [];
    try {
        const fData = readfs.readFileSync('./tmp/' + 'blockedLinks' + '.json');
        data = JSON.parse(fData);
        var delData = [];
        console.log("delData before = " + delData.length);
        for(var i = 0;i<data.length;i++){
            if(data[i].length > 70){
                delData.push(data[i]);
            }
        }
        console.log("delData after = " + delData.length);
        console.log("data before = " + data.length);
        data = data.filter( function( el ) {
            return delData.indexOf( el ) < 0;
        } );
        console.log("data after = " + data.length);
    } catch (err) {
        console.error("err: " + err);
    }
    await writeJson(data, "blockedLinks").then((d) => d)
        .catch((err) => console.error('writeJson() failed', err));
    if(res) res.status(201).send();
};

exports.setBlockedLinks =  async function(links) {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [links]
    };
    try {
        pShell.run('appendBlocked.py', options, function (err, results) {
            if (err) throw err;
            console.log("results appendBlocked = " + results);
            console.log("got blocked");
            // inputChoice();
        });
    } catch (e) {
        console.log(e)
    }
};

exports.appendResource = async function (newResource, desiredLink = "", desiredLinks) {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [newResource]
    };
    try {
        pShell.run('appendJSON.py', options, function (err, results) {
            if (err) throw err;
            console.log("results appendJSON = " + results);
            if (desiredLink != "") {
                appendDiscoveredLinks(desiredLinks);
            } else {
                // inputChoice();
            }
        });
    } catch (e) {
        console.log(e)
    }
};
exports.appendSkill = async function (skillElement) {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [skillElement]
    };
    try {
        pShell.run('appendSkill.py', options, function (err, results) {
            if (err) throw err;
            console.log("results appendSkill = " + results);
        });
    } catch (e) {
        console.log(e)
    }
};

async function appendDiscoveredLinks(newLinks) {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [newLinks]
    };
    try {
        pShell.run('appendLinks.py', options, function (err, results) {
            if (err) throw err;
            console.log("results appendLinks = " + results);
            console.log("got url");
            // inputChoice();
        });
    } catch (e) {
        console.log(e)
    }
}

exports.appendRating = async function (newRating, req = null, uEmail = "") {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [newRating]
    };
    try {
        pShell.run('appendRating.py', options, function (err, results) {
            if (err) throw err;
            console.log("results appendRating = " + results);
            recController.collaborativeBasedFiltering(req, null, null, uEmail);
        });
    } catch (e) {
        console.log(e)
    }
}

exports.updateRating = async function (newRating, req = null, uEmail = "") {
    const pShell = require('python-shell').PythonShell;
    let options = {
        mode: 'json',
        pythonPath: process.env.PY_PATH,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: process.env.PY_PROJ,
        args: [newRating]
    };
    try {
        pShell.run('updateRating.py', options, function (err, results) {
            if (err) throw err;
            console.log("results appendRating = " + results);
            recController.collaborativeBasedFiltering(req, null, null, uEmail);
        });
    } catch (e) {
        console.log(e)
    }
}

exports.writeJSON = writeJson;

async function writeJson(data, fileName, linkInjector = false) {
    const fs = require('fs').promises;
    await fs.open('./tmp/' + fileName + '.json', 'w');

    //garbage collection warning
    const file = await fs.writeFile('./tmp/' + fileName + '.json', JSON.stringify(data)).catch((err) => console.error("failed to write file", err));
}
//might move the json appending/writing operations to python
async function appendJson(data, fileName) {
    const fs = require('fs').promises;
    await fs.open('./tmp/' + fileName + '.json', 'a');

    let fileData;
    const readfs = require('fs');
    try {
        const fData = readfs.readFileSync('./tmp/' + fileName + '.json');
        fileData = JSON.parse(fData);
        fileData.push(JSON.stringify(data));
    } catch (err) {
        console.error(err);
    }

    const file = await fs.writeFile('./tmp/' + fileName + '.json', JSON.stringify(fileData)).catch((err) => console.error("failed to append file", err));
}

exports.exportAllData = async function (pyParentsChildrenContainer, newFoundCourses) {
    await writeJson(pyParentsChildrenContainer, "rawData").then((d) => d)
        .catch((err) => console.error('writeJson() failed', err));

    await writeJson(newFoundCourses, "learningResources").then((d) => d)
        .catch((err) => console.error('writeJson() failed', err));
};