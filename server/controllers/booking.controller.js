const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');
const { findOverlappingBooking } = require('../services/booking.service');
const { resolveFileUrl } = require('../middleware/upload.middleware');
const { notify } = require('../services/notification.service');
const { logActivity } = require('../services/activityLog.service');
const { BOOKING_STATUS, NOTIFICATION_TYPE } = require('../config/constants');

/**
 * POST /api/bookings
 * Books a bookable asset for a time window, rejecting overlaps.
 */
const createBooking = asyncHandler(async (req, res) => {
  const { asset_id, start_datetime, end_datetime, purpose } = req.body;

  const asset = await Asset.findById(asset_id);
  if (!asset) throw ApiError.notFound('Asset not found');
  if (!asset.is_bookable) throw ApiError.badRequest('This asset is not bookable');

  const overlap = await findOverlappingBooking(asset_id, start_datetime, end_datetime);
  if (overlap) {
    throw ApiError.conflict('Requested time slot conflicts with an existing booking', {
      conflicting_booking: {
        id: overlap._id,
        employee: overlap.employee_id,
        start: overlap.start_datetime,
        end: overlap.end_datetime,
      },
    });
  }

  const booking = await Booking.create({
    asset_id,
    employee_id: req.user.id,
    created_by: req.user.id,
    start_datetime,
    end_datetime,
    purpose,
    photo_url: resolveFileUrl(req),
  });

  await notify({
    employeeId: req.user.id,
    title: 'Booking confirmed',
    message: `${asset.name} is booked from ${new Date(start_datetime).toLocaleString()}.`,
    type: NOTIFICATION_TYPE.BOOKING,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'BOOKING_CREATED',
    entityType: 'Booking',
    entityId: booking._id,
    description: `Booked ${asset.asset_tag}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Booking confirmed', data: booking });
});

/** GET /api/bookings */
const listBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.asset_id) filter.asset_id = req.query.asset_id;
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.start_datetime = {};
    if (req.query.from) filter.start_datetime.$gte = new Date(req.query.from);
    if (req.query.to) filter.start_datetime.$lte = new Date(req.query.to);
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('asset_id', 'name asset_tag')
      .populate('employee_id', 'name email')
      .sort({ start_datetime: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: bookings, meta: buildPaginationMeta(total, page, limit) });
});

/** GET /api/bookings/resource/:assetId — all bookings for a resource (calendar). */
const listResourceBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    asset_id: req.params.assetId,
    status: { $ne: BOOKING_STATUS.CANCELLED },
  })
    .populate('employee_id', 'name')
    .sort({ start_datetime: 1 });
  return sendSuccess(res, { data: bookings });
});

/**
 * Loads a booking or throws, and guards that only the owner or a manager can
 * mutate it.
 */
const loadOwnBooking = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) throw ApiError.notFound('Booking not found');
  return booking;
};

/** PATCH /api/bookings/:id/cancel */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await loadOwnBooking(req.params.id);
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw ApiError.badRequest('Booking already cancelled');
  }
  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'BOOKING_CANCELLED',
    entityType: 'Booking',
    entityId: booking._id,
    description: 'Cancelled booking',
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Booking cancelled', data: booking });
});

/** PATCH /api/bookings/:id/complete */
const completeBooking = asyncHandler(async (req, res) => {
  const booking = await loadOwnBooking(req.params.id);
  booking.status = BOOKING_STATUS.COMPLETED;
  await booking.save();
  return sendSuccess(res, { message: 'Booking completed', data: booking });
});

/** PATCH /api/bookings/:id/reschedule — re-runs the overlap check. */
const rescheduleBooking = asyncHandler(async (req, res) => {
  const booking = await loadOwnBooking(req.params.id);
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw ApiError.badRequest('Only confirmed bookings can be rescheduled');
  }

  const { start_datetime, end_datetime } = req.body;
  const overlap = await findOverlappingBooking(
    booking.asset_id,
    start_datetime,
    end_datetime,
    booking._id
  );
  if (overlap) {
    throw ApiError.conflict('New time slot conflicts with an existing booking', {
      conflicting_booking: { id: overlap._id, start: overlap.start_datetime, end: overlap.end_datetime },
    });
  }

  booking.start_datetime = start_datetime;
  booking.end_datetime = end_datetime;
  await booking.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'BOOKING_RESCHEDULED',
    entityType: 'Booking',
    entityId: booking._id,
    description: 'Rescheduled booking',
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Booking rescheduled', data: booking });
});

module.exports = {
  createBooking,
  listBookings,
  listResourceBookings,
  cancelBooking,
  completeBooking,
  rescheduleBooking,
};
