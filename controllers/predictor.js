const express = require('express');
const accController = require('../api/Account').account;
const predController = require('../api/Predictor').predictor;
const router = express.Router();

router.post('/predict', function (req, res) {
    try {
        // let newSkill = JSON.stringify(req.body).split("\"")[1];
        let newSkill = req.body['skill'];
        let userid = req.body['userid'];
        let email = req.body['email'];
        console.log("newSkill: " + newSkill);
        console.log("userid: " + userid);
        console.log("email: " + email);
        console.log("req.body: " + JSON.stringify(req.body));
        predController.predict(newSkill, userid, email, res);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;