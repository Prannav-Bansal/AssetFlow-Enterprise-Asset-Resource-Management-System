const express = require('express');
const controller = require('../controllers/employee.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  updateEmployeeSchema,
  roleSchema,
  statusSchema,
} = require('../validators/employee.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.listEmployees);
router.get('/:id', controller.getEmployee);

const adminManager = [ROLES.ADMIN, ROLES.ASSET_MANAGER];
router.put('/:id', authorize(...adminManager), validate(updateEmployeeSchema), controller.updateEmployee);
router.patch('/:id/role', authorize(ROLES.ADMIN), validate(roleSchema), controller.setEmployeeRole);
router.patch(
  '/:id/status',
  authorize(...adminManager),
  validate(statusSchema),
  controller.setEmployeeStatus
);

module.exports = router;
