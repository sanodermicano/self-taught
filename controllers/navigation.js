const express = require('express');
const accController = require('../api/Account').account;
const jsonController = require('../api/JsonOperations').jsonOperations;
const skillsController = require('../api/SkillsList').skillsList;
const lpController = require('../api/linksPocket').linksPocket;
// const recController = require('../api/recommender');
const router = express.Router();

router.get('/', accController.isLoggedIn, jsonController.getSkillsMiddleware, skillsController.loadSkills, lpController.loadLinks, function (req, res) {
    // console.log("req.userLinks get /: " + req.userLinks);
    res.render("index", {skills: req.skills, user: req.user, userSkills: JSON.stringify(req.userSkills), userLinks: JSON.stringify(req.userLinks)});
});

router.get('/login', accController.isLoggedIn, function (req, res) {
    if(!req.user){
        res.render("login");
    }else{
        res.redirect("/");
    }
});

router.get('/register', accController.isLoggedIn, function (req, res) {
    if(!req.user){
        res.render("register");
    }else{
        res.redirect("/");
    }
});

router.get('/forgot', accController.isLoggedIn, function (req, res) {
    if(!req.user){
        res.render("forgot");
    }else{
        res.redirect("/");
    }
});

module.exports = router;