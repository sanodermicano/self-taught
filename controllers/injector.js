const express = require('express');
const accController = require('../api/acc');
const injectController = require('../api/injector');
const router = express.Router();

router.post('/link', accController.isLoggedIn, injectController.inject);
// router.get('/createLearningResoruces', injectController.createLearningResoruces); 

module.exports = router;