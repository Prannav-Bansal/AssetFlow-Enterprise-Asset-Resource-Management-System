const express = require('express');
const controller = require('../controllers/maintenance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  createMaintenanceSchema,
  rejectSchema,
  assignSchema,
  resolveSchema,
} = require('../validators/maintenance.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

const managerRoles = [ROLES.ADMIN, ROLES.ASSET_MANAGER];

router.get('/', controller.listRequests);
router.get('/:id', controller.getRequest);

// Any employee can raise a request.
router.post('/', upload.single('photo'), validate(createMaintenanceSchema), controller.createRequest);

// Workflow transitions are manager-controlled.
router.patch('/:id/approve', authorize(...managerRoles), controller.approveRequest);
router.patch('/:id/reject', authorize(...managerRoles), validate(rejectSchema), controller.rejectRequest);
router.patch('/:id/assign', authorize(...managerRoles), validate(assignSchema), controller.assignTechnician);
router.patch('/:id/resolve', authorize(...managerRoles), validate(resolveSchema), controller.resolveRequest);
router.patch('/:id/close', authorize(...managerRoles), controller.closeRequest);

module.exports = router;
