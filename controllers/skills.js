const express = require('express');
// const accController = require('../api/acc');
const skillsController = require('../api/skills');
const router = express.Router();

// router.post('/skills', accController.isLoggedIn, injectController.inject);
router.post('/skills', skillsController.addSkill);
router.post('/delSkill', skillsController.deleteSkill);
router.post('/editSkill', skillsController.editSkill);

module.exports = router;