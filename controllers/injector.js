const express = require('express');
const accController = require('../api/acc');
const injectController = require('../api/injector');
const jsonController = require('../api/jsonOps');
const router = express.Router();

router.post('/link', accController.isLoggedIn, injectController.inject);
router.get('/createLearningResoruces', injectController.createLearningResoruces); //demo purposes
router.get('/deleteBlockedLinks', jsonController.deleteBlockedLinks); //demo purposes

module.exports = router;