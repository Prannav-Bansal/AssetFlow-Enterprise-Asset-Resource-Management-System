const express = require('express');
const controller = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('../validators/category.validator');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.listCategories);
router.get('/:id', controller.getCategory);

const managerRoles = [ROLES.ADMIN, ROLES.ASSET_MANAGER];
router.post('/', authorize(...managerRoles), validate(createCategorySchema), controller.createCategory);
router.put('/:id', authorize(...managerRoles), validate(updateCategorySchema), controller.updateCategory);
router.delete('/:id', authorize(ROLES.ADMIN), controller.deleteCategory);

module.exports = router;
