const db = require('../models/mysql').mySQL;
const bcrypt = require('bcrypt');
const jsonController = require('./JsonOperations').jsonOperations;

class LinksPocket {
    constructor() { }

    //methods
    addLink = async function (req, res) {
        try {
            console.log(req.body);
            var { title, desc, link, date, lrid, userid, email } = req.body;
            let SQLID = 0;
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), userid)) {
                    return res.status(500).send();
                } else {
                    db.util.query('SELECT title FROM visited WHERE lrid = ? AND userid = ?', [lrid, SQLID], async function (error, results) {
                        console.log("title: " + title + "\ndesc: " + desc + "\nlink: " + link + "\ndate: " + date + "\nlrid: " + lrid + "\nemail: " + email + "\nSQLID: " + SQLID);
                        if (error) {
                            console.log(error);
                        }
                        if (results) {
                            if (results.length > 0) {
                                console.log("Removed Duplicate Learning Resources");
                                return res.status(500).send();
                            }
                        }
                        console.log("desc:____________________________________________________");
                        console.log("desc: " + desc);
                        desc = desc.replace(/[^a-z0-9 ]/gi, "");
                        const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                        const expressionHTTP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                        desc = desc.replace(/\s+/g, ' ').trim();
                        desc = desc.replace(expressionHTTP, "");
                        desc = desc.replace(expression, "");
                        console.log("desc into visited: " + desc);
                        db.util.query('INSERT INTO visited SET ?', { title: title, description: desc, link: link, rating: 2.5, date: date, lrid: lrid, userid: SQLID }, function (error, results) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("______________________________\n" + results);
                            }
                        });
                        res.status(201).send();
                        /*
                        {
                            "userId": 610,
                            "lrId": 170875,
                            "rating": 3
                        }
                        */
                        await jsonController.appendRating(JSON.stringify({ "userId": SQLID, "lrId": parseInt(lrid), "rating": 2.5 }), req, email);
                    });
                }
            });
        } catch (e) {
            res.status(500).send();
        }
    }

    loadLinks = async function (req, res, next) {
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
                        db.util.query('SELECT * FROM visited WHERE userid = ? ORDER BY date ASC', [SQLID], function (error, results) {
                            console.log("_____________________loadLinks_________________________");
                            if (error) {
                                console.log(error);
                            }
                            // console.log("results: " + JSON.stringify(results));
                            req.userLinks = results;
                            return next();
                        });
                    }
                });
            } else {
                console.log("account isn't logged in loadLinks");
                return next();
            }
        } catch (e) {
            res.status(500).send();
            console.log("failed 2 loadLinks");
            next();
        }
    }

    rateLink = async function (req, res) {
        try {
            const { lrid, rating, userid, email } = req.body;
            let SQLID = 0;
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), userid)) {
                    return res.status(500).send();
                } else {
                    console.log("SQLID: " + SQLID + "\nlrid: " + lrid + "\nrating: " + rating);
                    db.util.query('UPDATE visited SET rating = ? WHERE userid = ? AND lrid = ?', [rating, SQLID, lrid], async function (error, results) {
                        if (error) {
                            console.log(error);
                        }
                        res.status(201).send();
                        jsonController.updateRating(JSON.stringify({ "userId": SQLID, "lrId": parseInt(lrid), "rating": rating }), req, email);
                    });
                }
            });
        } catch (e) {
            res.status(500).send();
            console.log("failed rateLink: " + e);
        }
    }

    updateLinkDate = async function (req, res) {
        try {
            const { lrid, date, userid, email } = req.body;
            let SQLID = 0;
            db.util.query('SELECT id FROM user WHERE email = ?', [email], async function (error, results) {
                console.log("userid: " + userid);
                SQLID = results[0].id;
                console.log("SQLID: " + SQLID);
                if (!await bcrypt.compare(SQLID.toString(), userid)) {
                    return res.status(500).send();
                } else {
                    console.log("SQLID: " + SQLID + "\nlrid: " + lrid + "\ndate: " + date);
                    db.util.query('UPDATE visited SET date = ? WHERE userid = ? AND lrid = ?', [date, SQLID, lrid], async function (error, results) {
                        if (error) {
                            console.log(error);
                        }
                        res.status(201).send();
                    });
                }
            });
        } catch (e) {
            res.status(500).send();
            console.log("failed rateLink: " + e);
        }
    }
}

module.exports.linksPocket = new LinksPocket();