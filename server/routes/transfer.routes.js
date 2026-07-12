const express = require('express');
const controller = require('../controllers/transfer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createTransferSchema,
  rejectTransferSchema,
} = require('../validators/allocation.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

const approverRoles = [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD];

router.get('/', controller.listTransfers);
// Any authenticated user can request a transfer (e.g. the current holder).
router.post('/', validate(createTransferSchema), controller.createTransfer);
router.patch('/:id/approve', authorize(...approverRoles), controller.approveTransfer);
router.patch(
  '/:id/reject',
  authorize(...approverRoles),
  validate(rejectTransferSchema),
  controller.rejectTransfer
);

module.exports = router;
