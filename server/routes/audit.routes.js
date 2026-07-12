const express = require('express');
const controller = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  createCycleSchema,
  assignAuditorsSchema,
  recordResultSchema,
} = require('../validators/audit.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

const managerRoles = [ROLES.ADMIN, ROLES.ASSET_MANAGER];

// --- Cycles ---
router.get('/cycles', controller.listCycles);
router.get('/cycles/:id', controller.getCycle);
router.get('/cycles/:id/records', controller.listRecords);
router.get('/cycles/:id/report', controller.getReport);

router.post('/cycles', authorize(...managerRoles), validate(createCycleSchema), controller.createCycle);
router.patch('/cycles/:id/start', authorize(...managerRoles), controller.startCycle);
router.post(
  '/cycles/:id/assign',
  authorize(...managerRoles),
  validate(assignAuditorsSchema),
  controller.assignAuditors
);
router.patch('/cycles/:id/complete', authorize(...managerRoles), controller.completeCycle);
router.patch('/cycles/:id/close', authorize(...managerRoles), controller.closeCycle);

// --- Records --- (assigned auditors record results)
router.patch(
  '/records/:id',
  upload.single('photo'),
  validate(recordResultSchema),
  controller.recordResult
);

module.exports = router;
