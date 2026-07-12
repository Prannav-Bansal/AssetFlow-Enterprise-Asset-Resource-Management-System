const express = require('express');
const controller = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Reports are for managers and above.
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD));

router.get('/utilization', controller.utilization);
router.get('/maintenance-frequency', controller.maintenanceFrequency);
router.get('/department-allocation', controller.departmentAllocation);
router.get('/booking-heatmap', controller.bookingHeatmap);
router.get('/assets-due', controller.assetsDue);

module.exports = router;
