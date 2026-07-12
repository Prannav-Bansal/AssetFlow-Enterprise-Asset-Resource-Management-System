const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const AssetAllocation = require('../models/AssetAllocation');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');
const { notify } = require('../services/notification.service');
const { logActivity } = require('../services/activityLog.service');
const {
  ASSET_STATUS,
  ALLOCATION_STATUS,
  NOTIFICATION_TYPE,
} = require('../config/constants');

/**
 * Returns the currently active/overdue allocation for an asset, if any.
 * Used for the conflict check so an asset is never double-allocated.
 */
const findActiveAllocation = (assetId) =>
  AssetAllocation.findOne({
    asset_id: assetId,
    status: { $in: [ALLOCATION_STATUS.ACTIVE, ALLOCATION_STATUS.OVERDUE] },
  }).populate('employee_id', 'name email');

/**
 * POST /api/allocations
 * Allocates an available asset to an employee. Blocks if the asset already has
 * an active allocation and returns the current holder so the UI can offer a
 * transfer instead.
 */
const createAllocation = asyncHandler(async (req, res) => {
  const { asset_id, employee_id, department_id, expected_return_date } = req.body;

  const [asset, employee] = await Promise.all([
    Asset.findById(asset_id),
    Employee.findById(employee_id),
  ]);
  if (!asset) throw ApiError.notFound('Asset not found');
  if (!employee) throw ApiError.badRequest('Employee not found');

  const existing = await findActiveAllocation(asset_id);
  if (existing) {
    throw ApiError.conflict('Asset is already allocated', {
      current_holder: existing.employee_id,
      allocation_id: existing._id,
      hint: 'Request a transfer to reassign this asset',
    });
  }
  if (![ASSET_STATUS.AVAILABLE, ASSET_STATUS.RESERVED].includes(asset.status)) {
    throw ApiError.badRequest(`Asset is not allocatable while ${asset.status}`);
  }

  const allocation = await AssetAllocation.create({
    asset_id,
    employee_id,
    department_id: department_id || employee.department_id || null,
    allocated_by: req.user.id,
    expected_return_date: expected_return_date || null,
  });

  asset.status = ASSET_STATUS.ALLOCATED;
  await asset.save();

  await notify({
    employeeId: employee_id,
    title: 'Asset allocated to you',
    message: `${asset.name} (${asset.asset_tag}) has been allocated to you.`,
    type: NOTIFICATION_TYPE.RETURN,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'ALLOCATION_CREATED',
    entityType: 'AssetAllocation',
    entityId: allocation._id,
    description: `Allocated ${asset.asset_tag} to ${employee.name}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Asset allocated', data: allocation });
});

/**
 * GET /api/allocations
 * Filter by employee, department, asset, status, and overdue flag.
 */
const listAllocations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  if (req.query.department_id) filter.department_id = req.query.department_id;
  if (req.query.asset_id) filter.asset_id = req.query.asset_id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.overdue === 'true') {
    filter.status = ALLOCATION_STATUS.ACTIVE;
    filter.expected_return_date = { $lt: new Date() };
  }

  const [allocations, total] = await Promise.all([
    AssetAllocation.find(filter)
      .populate('asset_id', 'name asset_tag status')
      .populate('employee_id', 'name email')
      .populate('department_id', 'name')
      .populate('allocated_by', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    AssetAllocation.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: allocations, meta: buildPaginationMeta(total, page, limit) });
});

/** GET /api/allocations/overdue */
const listOverdue = asyncHandler(async (req, res) => {
  const allocations = await AssetAllocation.find({
    status: { $in: [ALLOCATION_STATUS.ACTIVE, ALLOCATION_STATUS.OVERDUE] },
    expected_return_date: { $lt: new Date() },
  })
    .populate('asset_id', 'name asset_tag')
    .populate('employee_id', 'name email')
    .sort({ expected_return_date: 1 });

  return sendSuccess(res, { data: allocations });
});

/**
 * POST /api/allocations/:id/return
 * Returns the asset, records its condition, and frees it for reallocation.
 */
const returnAllocation = asyncHandler(async (req, res) => {
  const allocation = await AssetAllocation.findById(req.params.id).populate('asset_id');
  if (!allocation) throw ApiError.notFound('Allocation not found');
  if (allocation.status === ALLOCATION_STATUS.RETURNED) {
    throw ApiError.badRequest('This allocation has already been returned');
  }

  allocation.status = ALLOCATION_STATUS.RETURNED;
  allocation.returned_date = new Date();
  allocation.condition_on_return = req.body.condition_on_return;
  allocation.return_notes = req.body.return_notes;
  await allocation.save();

  const asset = allocation.asset_id;
  if (asset) {
    asset.status = ASSET_STATUS.AVAILABLE;
    await asset.save();
  }

  await notify({
    employeeId: allocation.employee_id,
    title: 'Asset returned',
    message: `Return of ${asset?.name || 'asset'} has been recorded.`,
    type: NOTIFICATION_TYPE.RETURN,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'ALLOCATION_RETURNED',
    entityType: 'AssetAllocation',
    entityId: allocation._id,
    description: `Returned ${asset?.asset_tag || 'asset'}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Asset returned', data: allocation });
});

module.exports = {
  createAllocation,
  listAllocations,
  listOverdue,
  returnAllocation,
  findActiveAllocation,
};
