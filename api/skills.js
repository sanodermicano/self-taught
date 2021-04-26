const db = require('../models/db');
const bcrypt = require('bcrypt');

exports.addSkill = async function (req, res) {
    try {
        console.log(req.body);
        const { name, level, position, userid, email } = req.body;
        let SQLID = 0;
        db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
            console.log("userid: " + userid);
            SQLID = results[0].id;
            console.log("SQLID: " + SQLID);
            if (!await bcrypt.compare(SQLID.toString(), userid)) {
                return res.status(500).send();
            } else {
                db.util.query('SELECT name FROM skill WHERE name = ? AND userid = ?', [name, SQLID], async function (error, results) {
                    console.log("name: " + name + "\nlevel: " + level + "\nposition: " + position + "\nSQLID: " + SQLID);

                    if (error) {
                        console.log(error);
                    }
                    if(results){
                        if (results.length > 0) {
                            console.log("Removed Duplicates");
                            return res.status(500).send();
                        }
                    }
                    db.util.query('INSERT INTO skill SET ?', { name: name, level: level, position: position, userid: SQLID }, function (error, results) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("______________________________\n" + results);
                        }
                    });
                    res.status(201).send();
                });
            }
        });
    } catch (e) {
        res.status(500).send();
    }
}

exports.loadSkills = async function (req, res, next) {
    try {
        if (req.user) {
            let id = req.user.id;
            let email = req.user.email;
            let SQLID = 0;
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + id);
                SQLID = results[0].id;
                console.log("SQLID: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), id)) {
                    return res.status(500).send();
                } else {
                    // db.util.query('SELECT * FROM skill WHERE userid = ? ORDER BY position DESC', [SQLID], async function (error, results) {
                    db.util.query('SELECT * FROM skill WHERE userid = ?', [SQLID], function (error, results) {
                        console.log("______________________________________________");
                        if (error) {
                            console.log(error);
                        }
                        console.log("results: " + JSON.stringify(results));
                        req.userSkills = results;
                        return next();
                    });
                }
            });
        } else {
            console.log("account isn't logged in");
            return next();
        }
    } catch (e) {
        res.status(500).send();
        console.log("failed 2");
        next();
    }
}

exports.editSkill = async function (req, res) {
    try {
        const { name, level, userid, email } = req.body;
        let SQLID = 0;
        db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
            console.log("userid: " + userid);
            SQLID = results[0].id;
            console.log("SQLID: " + SQLID);
            if (!await bcrypt.compare(SQLID.toString(), userid)) {
                return res.status(500).send();
            } else {
                console.log("SQLID: " + SQLID + "\nlevel: " + level + "\nname: " + name);
                db.util.query('UPDATE skill SET level = ? WHERE userid = ? AND name = ?', [level, SQLID, name], async function (error, results) {
                    if (error) {
                        console.log(error);
                    }
                    res.status(201).send();
                });
            }
        });
    } catch (e) {
        res.status(500).send();
        console.log("failed edit: " + e);
    }
}
exports.deleteSkill = async function (req, res) {
    try {
        const { name, userid, email } = req.body;
        let SQLID = 0;
        db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
            console.log("userid: " + userid);
            SQLID = results[0].id;
            console.log("SQLID: " + SQLID);
            if (!await bcrypt.compare(SQLID.toString(), userid)) {
                return res.status(500).send();
            } else {
                console.log("SQLID: " + SQLID + "\nname: " + name);
                db.util.query('DELETE FROM skill WHERE userid = ? AND name = ?', [SQLID, name], async function (error, results) {
                    if (error) {
                        console.log(error);
                    }
                    res.status(201).send();
                });
            }
        });
    } catch (e) {
        res.status(500).send();
        console.log("failed del: " + e);
    }
}