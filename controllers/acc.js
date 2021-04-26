const express = require('express');
const accController = require('../api/acc');
const router = express.Router();

router.post('/login', accController.login);
router.post('/register', accController.register);
router.get('/logout', accController.logout);

module.exports = router;