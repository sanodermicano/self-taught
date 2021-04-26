const express = require('express');
const accController = require('../api/acc');
const predController = require('../api/predictor');
const router = express.Router();

// router.post('/predict', accController.isLoggedIn, function (req, res) {
router.post('/predict', function (req, res) {
    // if (req.user) {
        try {
            let newSkill = JSON.stringify(req.body).split("\"")[1];
            predController.predict(newSkill, res);
        } catch (e) {
            console.log(e);
        }
    // } else {
    //     res.redirect("/");
    // }
});

module.exports = router;