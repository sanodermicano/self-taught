const express = require('express');
const buildController = require('../api/skilltreeBuilder');
const router = express.Router();

// router.get('/builder', buildController.buildSkillTree);

// router.get('/initializeSkillTree', async function(req, res){
//     await buildController.buildTestSkillTree();
// });
router.get('/buildSkills', buildController.buildTree); //demo purposes
// router.get('/updateSkills', buildController.cleanSkillTree);

module.exports = router;