const express = require('express');
const controller = require('../controllers/asset.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  createAssetSchema,
  updateAssetSchema,
  statusSchema,
} = require('../validators/asset.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

const managerRoles = [ROLES.ADMIN, ROLES.ASSET_MANAGER];

router.get('/', controller.listAssets);
router.get('/:id', controller.getAsset);
router.get('/:id/history', controller.getAssetHistory);
router.get('/:id/maintenance', controller.getAssetMaintenance);

// `upload.single('photo')` runs before validation so multipart text fields are
// parsed into req.body for Joi.
router.post(
  '/',
  authorize(...managerRoles),
  upload.single('photo'),
  validate(createAssetSchema),
  controller.createAsset
);
router.put(
  '/:id',
  authorize(...managerRoles),
  upload.single('photo'),
  validate(updateAssetSchema),
  controller.updateAsset
);
router.patch('/:id/status', authorize(...managerRoles), validate(statusSchema), controller.setAssetStatus);

module.exports = router;
