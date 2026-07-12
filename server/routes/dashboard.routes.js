const express = require('express');
const controller = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/kpis', controller.getKpis);
router.get('/overdue', controller.getOverdue);
router.get('/upcoming-returns', controller.getUpcomingReturns);

module.exports = router;
