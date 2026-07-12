const AssetCategory = require('../models/AssetCategory');
const Asset = require('../models/Asset');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { logActivity } = require('../services/activityLog.service');
const { ACTIVE_STATUS } = require('../config/constants');

/** POST /api/categories */
const createCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.create(req.body);

  await logActivity({
    employeeId: req.user.id,
    action: 'CATEGORY_CREATED',
    entityType: 'AssetCategory',
    entityId: category._id,
    description: `Created category "${category.name}"`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Category created', data: category });
});

/** GET /api/categories */
const listCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const categories = await AssetCategory.find(filter).sort({ name: 1 });
  return sendSuccess(res, { data: categories });
});

/** GET /api/categories/:id */
const getCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  return sendSuccess(res, { data: category });
});

/** PUT /api/categories/:id */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound('Category not found');

  await logActivity({
    employeeId: req.user.id,
    action: 'CATEGORY_UPDATED',
    entityType: 'AssetCategory',
    entityId: category._id,
    description: `Updated category "${category.name}"`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Category updated', data: category });
});

/**
 * DELETE /api/categories/:id
 * Soft-deletes (deactivates) a category. Blocked if any asset still references
 * it, so history and reports never point at a missing category.
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const assetCount = await Asset.countDocuments({ category_id: category._id });
  if (assetCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: ${assetCount} asset(s) still use this category. Reassign them first.`
    );
  }

  category.status = ACTIVE_STATUS.INACTIVE;
  await category.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'CATEGORY_DEACTIVATED',
    entityType: 'AssetCategory',
    entityId: category._id,
    description: `Deactivated category "${category.name}"`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Category deactivated', data: category });
});

module.exports = { createCategory, listCategories, getCategory, updateCategory, deleteCategory };
