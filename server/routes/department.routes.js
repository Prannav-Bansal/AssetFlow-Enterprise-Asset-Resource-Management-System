const express = require('express');
const controller = require('../controllers/department.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  statusSchema,
} = require('../validators/department.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.listDepartments);
router.get('/:id', controller.getDepartment);

// Mutations are Admin-only.
router.post('/', authorize(ROLES.ADMIN), validate(createDepartmentSchema), controller.createDepartment);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateDepartmentSchema), controller.updateDepartment);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN),
  validate(statusSchema),
  controller.setDepartmentStatus
);

module.exports = router;
