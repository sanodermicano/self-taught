const express = require('express');
const lpController = require('../api/linksPocket').linksPocket;
const router = express.Router();

router.post('/clinkspocket', lpController.addLink);
router.post('/rlinkspocket', lpController.rateLink);
router.post('/ulinkspocket', lpController.updateLinkDate);

module.exports = router;