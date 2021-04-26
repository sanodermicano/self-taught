const express = require('express');
const accController = require('../api/acc');
const recController = require('../api/recommender');
const router = express.Router();

//handles recommendation and splitting the recommendations into pages
// router.post('/recommend', accController.isLoggedIn, function (req, res) {
router.post('/recommend', function (req, res) {
    // if (req.user) {
        try {
            recController.recommend(req, res);
        } catch (e) {
            console.log(e);
        }
    // } else {
    //     res.redirect("/");
    // }
});

module.exports = router;