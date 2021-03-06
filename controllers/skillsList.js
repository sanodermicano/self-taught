const express = require('express');
// const accController = require('../api/acc');
const skillsController = require('../api/SkillsList').skillsList;
const router = express.Router();

// router.post('/skills', accController.isLoggedIn, injectController.inject);
router.post('/skills', skillsController.addSkill);
router.post('/delSkill', skillsController.deleteSkill);
router.post('/editSkill', skillsController.editSkill);
router.post('/switchSkill', skillsController.switchSkill);

module.exports = router;