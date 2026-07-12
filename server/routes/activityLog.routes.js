const express = require('express');
const controller = require('../controllers/activityLog.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Activity logs are an admin audit tool.
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', controller.listLogs);

module.exports = router;
