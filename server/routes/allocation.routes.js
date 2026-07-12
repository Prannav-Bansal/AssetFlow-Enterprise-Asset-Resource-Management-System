const express = require('express');
const controller = require('../controllers/allocation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createAllocationSchema,
  returnAllocationSchema,
} = require('../validators/allocation.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

const managerRoles = [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD];

router.get('/', controller.listAllocations);
router.get('/overdue', controller.listOverdue);

router.post('/', authorize(...managerRoles), validate(createAllocationSchema), controller.createAllocation);
router.post(
  '/:id/return',
  authorize(...managerRoles),
  validate(returnAllocationSchema),
  controller.returnAllocation
);

module.exports = router;
