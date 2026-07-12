const Asset = require('../models/Asset');
const AssetCategory = require('../models/AssetCategory');
const AssetAllocation = require('../models/AssetAllocation');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');
const { generateAssetTag } = require('../utils/assetTagGenerator');
const { resolveFileUrl } = require('../middleware/upload.middleware');
const { assertValidStatusTransition } = require('../services/asset.service');
const { logActivity } = require('../services/activityLog.service');

/**
 * POST /api/assets
 * Registers a new asset with an auto-generated tag and optional photo.
 */
const createAsset = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findById(req.body.category_id);
  if (!category) throw ApiError.badRequest('Category not found');

  const asset_tag = await generateAssetTag();
  const asset = await Asset.create({
    ...req.body,
    asset_tag,
    photo_url: resolveFileUrl(req),
    created_by: req.user.id,
  });

  await logActivity({
    employeeId: req.user.id,
    action: 'ASSET_CREATED',
    entityType: 'Asset',
    entityId: asset._id,
    description: `Registered asset ${asset.asset_tag} — ${asset.name}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Asset registered', data: asset });
});

/**
 * GET /api/assets
 * Rich filtering: tag, serial, category, status, location, bookable, and text
 * search over name/tag/serial.
 */
const listAssets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.category_id) filter.category_id = req.query.category_id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.location) filter.location = new RegExp(req.query.location, 'i');
  if (req.query.asset_tag) filter.asset_tag = new RegExp(req.query.asset_tag, 'i');
  if (req.query.serial_number) filter.serial_number = new RegExp(req.query.serial_number, 'i');
  if (req.query.is_bookable !== undefined) filter.is_bookable = req.query.is_bookable === 'true';
  if (req.query.search) {
    const rx = new RegExp(req.query.search.trim(), 'i');
    filter.$or = [{ name: rx }, { asset_tag: rx }, { serial_number: rx }];
  }

  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .populate('category_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    Asset.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: assets, meta: buildPaginationMeta(total, page, limit) });
});

/**
 * GET /api/assets/:id
 * Full detail including current holder and recent allocation/maintenance history.
 */
const getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('category_id', 'name custom_fields')
    .populate('created_by', 'name email');
  if (!asset) throw ApiError.notFound('Asset not found');

  const [currentAllocation, allocationHistory, maintenanceHistory] = await Promise.all([
    AssetAllocation.findOne({ asset_id: asset._id, status: { $ne: 'Returned' } })
      .populate('employee_id', 'name email')
      .populate('department_id', 'name'),
    AssetAllocation.find({ asset_id: asset._id })
      .populate('employee_id', 'name')
      .sort({ created_at: -1 })
      .limit(20),
    MaintenanceRequest.find({ asset_id: asset._id })
      .populate('requested_by', 'name')
      .sort({ requested_at: -1 })
      .limit(20),
  ]);

  return sendSuccess(res, {
    data: {
      asset,
      current_holder: currentAllocation,
      allocation_history: allocationHistory,
      maintenance_history: maintenanceHistory,
    },
  });
});

/** PUT /api/assets/:id */
const updateAsset = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  const fileUrl = resolveFileUrl(req);
  if (fileUrl) update.photo_url = fileUrl;

  const asset = await Asset.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!asset) throw ApiError.notFound('Asset not found');

  await logActivity({
    employeeId: req.user.id,
    action: 'ASSET_UPDATED',
    entityType: 'Asset',
    entityId: asset._id,
    description: `Updated asset ${asset.asset_tag}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Asset updated', data: asset });
});

/**
 * PATCH /api/assets/:id/status
 * Manual lifecycle transition (validated against the allowed transition map).
 */
const setAssetStatus = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) throw ApiError.notFound('Asset not found');

  const { status, note } = req.body;
  assertValidStatusTransition(asset.status, status);

  const previous = asset.status;
  asset.status = status;
  await asset.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'ASSET_STATUS_CHANGED',
    entityType: 'Asset',
    entityId: asset._id,
    description: `Asset ${asset.asset_tag}: ${previous} → ${status}`,
    metadata: { from: previous, to: status, note },
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: `Asset status set to ${status}`, data: asset });
});

/**
 * GET /api/assets/:id/history
 * Combined, chronologically sorted allocation + maintenance timeline.
 */
const getAssetHistory = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).select('_id asset_tag name');
  if (!asset) throw ApiError.notFound('Asset not found');

  const [allocations, maintenance] = await Promise.all([
    AssetAllocation.find({ asset_id: asset._id }).populate('employee_id', 'name'),
    MaintenanceRequest.find({ asset_id: asset._id }).populate('requested_by', 'name'),
  ]);

  const timeline = [
    ...allocations.map((a) => ({
      type: 'allocation',
      at: a.allocated_date,
      status: a.status,
      actor: a.employee_id?.name,
      detail: a.status === 'Returned' ? 'Returned' : 'Allocated',
      ref: a._id,
    })),
    ...maintenance.map((m) => ({
      type: 'maintenance',
      at: m.requested_at,
      status: m.status,
      actor: m.requested_by?.name,
      detail: m.issue_description,
      ref: m._id,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  return sendSuccess(res, { data: { asset, timeline } });
});

/** GET /api/assets/:id/maintenance — maintenance history for one asset. */
const getAssetMaintenance = asyncHandler(async (req, res) => {
  const records = await MaintenanceRequest.find({ asset_id: req.params.id })
    .populate('requested_by', 'name')
    .populate('technician_id', 'name')
    .sort({ requested_at: -1 });
  return sendSuccess(res, { data: records });
});

module.exports = {
  createAsset,
  listAssets,
  getAsset,
  updateAsset,
  setAssetStatus,
  getAssetHistory,
  getAssetMaintenance,
};
