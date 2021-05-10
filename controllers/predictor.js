const express = require('express');
const accController = require('../api/Account').account;
const predController = require('../api/Predictor').predictor;
const router = express.Router();

router.post('/predict', function (req, res) {
    try {
        let newSkill = JSON.stringify(req.body).split("\"")[1];
        predController.predict(newSkill, res);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;