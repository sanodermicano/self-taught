const express = require('express');
const accController = require('../api/Account').account;
const injectController = require('../api/injector').injector;
const jsonController = require('../api/JsonOperations').jsonOperations;
const router = express.Router();

router.post('/link', accController.isLoggedIn, injectController.inject);
router.get('/createLearningResoruces', injectController.createLearningResoruces); //demo purposes
router.get('/deleteBlockedLinks', jsonController.deleteBlockedLinks); //demo purposes

module.exports = router;