const express = require('express');

const router = express.Router();

// Mount every feature router under its resource path.
router.use('/auth', require('./auth.routes'));
router.use('/departments', require('./department.routes'));
router.use('/categories', require('./category.routes'));
router.use('/employees', require('./employee.routes'));
router.use('/assets', require('./asset.routes'));
router.use('/allocations', require('./allocation.routes'));
router.use('/transfers', require('./transfer.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/maintenance', require('./maintenance.routes'));
router.use('/audits', require('./audit.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/activity-logs', require('./activityLog.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/reports', require('./report.routes'));

module.exports = router;
