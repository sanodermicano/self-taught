const express = require('express');
const accController = require('../api/Account').account;
const router = express.Router();

router.post('/login', accController.login);
router.post('/register', accController.register);
// router.post('/forgot', accController.forgot);
router.get('/logout', accController.logout);

module.exports = router;