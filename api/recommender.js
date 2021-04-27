require("dotenv").config();

let learningResources = ["emptyemptyemptyempty"];
let prevSkills;

exports.recommend = function (req, res) {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        console.log("page = " + page + ", limit = " + limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const result = {};
        //instead of returning the original learningResources, return a copy modified by either the recommender or the filters
        //if injection checked failed, add to blacklisted link
        console.log("startIndex = " + startIndex + ", endIndex = " + endIndex);
        console.log("learningResources.length = " + learningResources[0].length);

        let skills = req.body['skillsListBackup[]'];
        if (prevSkills != skills) {
            prevSkills = skills;
            searchSkill(skills, res, result, page, limit); // handle that this will receive multiple skills
        } else {
            result.results = learningResources[0].slice(startIndex, endIndex);
            result.allPages = Math.round(learningResources[0].length / limit);
            if (endIndex < learningResources[0].length) {
                console.log("endIndex<learningResources.length");
                result.next = {
                    page: page + 1,
                    limit: limit
                };
            }
            if (startIndex > 0) {
                console.log("startIndex>0");
                result.previous = {
                    page: page - 1,
                    limit: limit
                };
            }
            res.send({ success: true, message: result });
        }
        console.log(skills);
        console.log(result);
        // res.send({success: true, message: learningResources});
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
                console.log("startIndex>0");
                result.previous = {
                    page: page - 1,
                    limit: limit
                };
            }
            res.send({ success: true, message: result });
            // inputChoice();
        });
    } catch (e) {
        console.log(e)
    }
}