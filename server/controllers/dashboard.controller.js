const Asset = require('../models/Asset');
const AssetAllocation = require('../models/AssetAllocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const {
  ASSET_STATUS,
  ALLOCATION_STATUS,
  BOOKING_STATUS,
  TRANSFER_STATUS,
  MAINTENANCE_STATUS,
} = require('../config/constants');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

/** GET /api/dashboard/kpis — headline counters for the dashboard. */
const getKpis = asyncHandler(async (req, res) => {
  const now = new Date();
  const [
    available,
    allocated,
    underMaintenance,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
    overdueReturns,
  ] = await Promise.all([
    Asset.countDocuments({ status: ASSET_STATUS.AVAILABLE }),
    Asset.countDocuments({ status: ASSET_STATUS.ALLOCATED }),
    Asset.countDocuments({ status: ASSET_STATUS.UNDER_MAINTENANCE }),
    MaintenanceRequest.countDocuments({ requested_at: { $gte: startOfToday() } }),
    Booking.countDocuments({
      status: BOOKING_STATUS.CONFIRMED,
      start_datetime: { $lte: now },
      end_datetime: { $gte: now },
    }),
    TransferRequest.countDocuments({ status: TRANSFER_STATUS.REQUESTED }),
    AssetAllocation.countDocuments({
      status: ALLOCATION_STATUS.ACTIVE,
      expected_return_date: { $gte: now, $lte: daysFromNow(7) },
    }),
    AssetAllocation.countDocuments({
      status: { $in: [ALLOCATION_STATUS.ACTIVE, ALLOCATION_STATUS.OVERDUE] },
      expected_return_date: { $lt: now },
    }),
  ]);

  return sendSuccess(res, {
    data: {
      assets_available: available,
      assets_allocated: allocated,
      assets_under_maintenance: underMaintenance,
      maintenance_requests_today: maintenanceToday,
      active_bookings: activeBookings,
      pending_transfers: pendingTransfers,
      upcoming_returns: upcomingReturns,
      overdue_returns: overdueReturns,
    },
  });
});

/** GET /api/dashboard/overdue — overdue allocation list. */
const getOverdue = asyncHandler(async (req, res) => {
  const allocations = await AssetAllocation.find({
    status: { $in: [ALLOCATION_STATUS.ACTIVE, ALLOCATION_STATUS.OVERDUE] },
    expected_return_date: { $lt: new Date() },
  })
    .populate('asset_id', 'name asset_tag')
    .populate('employee_id', 'name email')
    .sort({ expected_return_date: 1 });
  return sendSuccess(res, { data: allocations });
});

/** GET /api/dashboard/upcoming-returns — returns due within 7 days. */
const getUpcomingReturns = asyncHandler(async (req, res) => {
  const allocations = await AssetAllocation.find({
    status: ALLOCATION_STATUS.ACTIVE,
    expected_return_date: { $gte: new Date(), $lte: daysFromNow(7) },
  })
    .populate('asset_id', 'name asset_tag')
    .populate('employee_id', 'name email')
    .sort({ expected_return_date: 1 });
  return sendSuccess(res, { data: allocations });
});

module.exports = { getKpis, getOverdue, getUpcomingReturns };
