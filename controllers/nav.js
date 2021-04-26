const express = require('express');
const accController = require('../api/acc');
const jsonController = require('../api/jsonOps');
const skillsController = require('../api/skills');
const lpController = require('../api/linksPocket');
const router = express.Router();

//middleweres should be used to ensure the user not entering wrong pages
//problem is that 
router.get('/', accController.isLoggedIn, jsonController.getSkills, skillsController.loadSkills, lpController.loadLinks, function (req, res) {
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

module.exports = router;