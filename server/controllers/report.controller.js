const Asset = require('../models/Asset');
const AssetAllocation = require('../models/AssetAllocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { ASSET_STATUS } = require('../config/constants');

/**
 * GET /api/reports/utilization
 * Allocation count per asset — surfaces the most-used vs idle assets.
 */
const utilization = asyncHandler(async (req, res) => {
  const rows = await AssetAllocation.aggregate([
    { $group: { _id: '$asset_id', allocation_count: { $sum: 1 } } },
    { $lookup: { from: 'assets', localField: '_id', foreignField: '_id', as: 'asset' } },
    { $unwind: '$asset' },
    {
      $project: {
        _id: 0,
        asset_id: '$_id',
        name: '$asset.name',
        asset_tag: '$asset.asset_tag',
        status: '$asset.status',
        allocation_count: 1,
      },
    },
    { $sort: { allocation_count: -1 } },
  ]);

  // Assets that have never been allocated (idle).
  const allocatedIds = rows.map((r) => r.asset_id);
  const idle = await Asset.find({ _id: { $nin: allocatedIds } })
    .select('name asset_tag status')
    .limit(100);

  return sendSuccess(res, {
    data: {
      most_used: rows.slice(0, 20),
      idle_assets: idle.map((a) => ({
        asset_id: a._id,
        name: a.name,
        asset_tag: a.asset_tag,
        status: a.status,
        allocation_count: 0,
      })),
    },
  });
});

/**
 * GET /api/reports/maintenance-frequency
 * Maintenance request counts grouped by asset (with category label).
 */
const maintenanceFrequency = asyncHandler(async (req, res) => {
  const rows = await MaintenanceRequest.aggregate([
    { $group: { _id: '$asset_id', request_count: { $sum: 1 } } },
    { $lookup: { from: 'assets', localField: '_id', foreignField: '_id', as: 'asset' } },
    { $unwind: '$asset' },
    {
      $lookup: {
        from: 'assetcategories',
        localField: 'asset.category_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        asset_id: '$_id',
        name: '$asset.name',
        asset_tag: '$asset.asset_tag',
        category: '$category.name',
        request_count: 1,
      },
    },
    { $sort: { request_count: -1 } },
  ]);

  return sendSuccess(res, { data: rows });
});

/**
 * GET /api/reports/department-allocation
 * Active allocation counts grouped by department.
 */
const departmentAllocation = asyncHandler(async (req, res) => {
  const rows = await AssetAllocation.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$department_id', active_allocations: { $sum: 1 } } },
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        department_id: '$_id',
        department: { $ifNull: ['$department.name', 'Unassigned'] },
        active_allocations: 1,
      },
    },
    { $sort: { active_allocations: -1 } },
  ]);

  return sendSuccess(res, { data: rows });
});

/**
 * GET /api/reports/booking-heatmap
 * Booking counts per weekday × hour, for a peak-usage grid.
 */
const bookingHeatmap = asyncHandler(async (req, res) => {
  const rows = await Booking.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: {
          weekday: { $dayOfWeek: '$start_datetime' }, // 1 (Sun) .. 7 (Sat)
          hour: { $hour: '$start_datetime' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        weekday: '$_id.weekday',
        hour: '$_id.hour',
        count: 1,
      },
    },
    { $sort: { weekday: 1, hour: 1 } },
  ]);

  return sendSuccess(res, { data: rows });
});

/**
 * GET /api/reports/assets-due
 * Assets that are aging (near retirement) or repeatedly failing — a simple
 * heuristic: retired/lost assets plus those with 3+ maintenance requests.
 */
const assetsDue = asyncHandler(async (req, res) => {
  const frequentlyFailing = await MaintenanceRequest.aggregate([
    { $group: { _id: '$asset_id', count: { $sum: 1 } } },
    { $match: { count: { $gte: 3 } } },
    { $lookup: { from: 'assets', localField: '_id', foreignField: '_id', as: 'asset' } },
    { $unwind: '$asset' },
    {
      $project: {
        _id: 0,
        asset_id: '$_id',
        name: '$asset.name',
        asset_tag: '$asset.asset_tag',
        status: '$asset.status',
        maintenance_count: '$count',
      },
    },
    { $sort: { maintenance_count: -1 } },
  ]);

  const lifecycleFlagged = await Asset.find({
    status: { $in: [ASSET_STATUS.RETIRED, ASSET_STATUS.LOST] },
  }).select('name asset_tag status');

  return sendSuccess(res, {
    data: { frequently_failing: frequentlyFailing, lifecycle_flagged: lifecycleFlagged },
  });
});

module.exports = {
  utilization,
  maintenanceFrequency,
  departmentAllocation,
  bookingHeatmap,
  assetsDue,
};
