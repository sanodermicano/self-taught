const jwt = require('jsonwebtoken');
const db = require('../models/mysql');
const bcrypt = require('bcrypt');
const { promisify } = require('util');

exports.register = async function (req, res) {
    try {
        console.log(req.body);
        const { email, password, confirmPassword, name } = req.body;
        var expression = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!expression.test(String(email).toLowerCase())){
            console.log("not an email");
            res.status(500).send();
            return;
        }
        db.util.query('SELECT email FROM user WHERE email = ?', [String(email).toLowerCase()], async function (error, results) {
            console.log("email: " + String(email).toLowerCase() + "\npassword: " + password + "\nconfirmPassword: " + confirmPassword + "\nname: " + name);
            if (error) {
                console.log(error);
            }
            if (results.length > 0) {
                return res.render('register', {
                    message: 'The Entered Email is already in use'
                });
            } else if (password !== confirmPassword) {
                return res.render('register', {
                    message: 'Passwords do not match'
                });
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            db.util.query('INSERT INTO user SET ?', { email: String(email).toLowerCase(), password: hashedPassword, name: name }, function (error, results) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("______________________________\n" + results);
                }
            });
            res.status(201).send();
        });
    } catch {
        res.status(500).send();
    }
    return res.redirect("/login");
}

exports.login = async function (req, res, next) {
    try {
        console.log(req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please write an email and password'
            });
        }
        db.util.query('SELECT * FROM user WHERE email = ?', [email], async function (error, results) {
            if(results==null) return;
            if (!results[0] || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('login', {
                    message: 'Incorrect Email or Password'
                });
            } else {
                const id = results[0].id;
                const token = jwt.sign({ id: id }, process.env.JWT_KEY, {
                    expiresIn: process.env.JWT_EXPIRATION
                });
                console.log("token: " + token);
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('st', token, cookieOptions);
                res.status(200).redirect("/");
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
}

exports.isLoggedIn = async function(req, res, next) {
    console.log(req.cookies);
    if (req.cookies.st) {
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.st,
                process.env.JWT_KEY
            );
            console.log("dec: " + decoded);
            db.util.query('SELECT * FROM user WHERE id = ?', [decoded.id], async function (error, result) {
                if (!result) {
                    return next();
                }
                req.user = result[0];
                console.log("result[0]: " + result[0]);
                const salt = await bcrypt.genSalt();
                const hashedID = await bcrypt.hash(result[0].id.toString(), salt);
                console.log("id: " + result[0].id);
                req.user.id = hashedID;
                console.log("id: " + result[0].id);
                console.log("req.user: " + req.user);
                console.log("next isLoggedIn");
                return next();
            });
        } catch (err) {
            console.log("try err" + err);
            return next();
        }
    } else {
        next();
    }
};

exports.logout = function(req, res){
    res.cookie('st', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });
    res.locals.req = req;
    res.locals.res = res;
    res.clearCookie("st");
    res.status(200).redirect("/");
}