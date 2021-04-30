const express = require('express');
const accController = require('../api/acc');
const jsonController = require('../api/jsonOps');
const skillsController = require('../api/skills');
const lpController = require('../api/linksPocket');
const recController = require('../api/recommender');
const router = express.Router();

//middleweres should be used to ensure the user not entering wrong pages
//problem is that 
router.get('/', accController.isLoggedIn, jsonController.getSkills, skillsController.loadSkills, lpController.loadLinks, recController.collaborativeBasedFiltering, function (req, res) {
    // console.log("req.userLinks get /: " + req.userLinks);
    res.render("index", {skills: req.skills, user: req.user, userSkills: JSON.stringify(req.userSkills), userLinks: JSON.stringify(req.userLinks)});
    //on load and on adding a new link run collab filter, on close tab, delete the user from the hashmap storing their sorted LR
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