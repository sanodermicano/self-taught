const express = require('express');
const recController = require('../api/Recommender').recommender;
const router = express.Router();

router.post('/recommend', function (req, res) {
        try {
            recController.recommend(req, res);
        } catch (e) {
            console.log(e);
        }
});
router.post('/clean', function (req, res) {
    try {
        recController.cleanUser(req, res);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;