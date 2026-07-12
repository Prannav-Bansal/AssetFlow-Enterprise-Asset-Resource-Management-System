const Booking = require('../models/Booking');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * Finds a booking that overlaps the given [start, end) window for an asset.
 * Two intervals overlap iff existing.start < newEnd AND existing.end > newStart.
 * Cancelled bookings are ignored; `excludeId` lets a reschedule skip itself.
 */
const findOverlappingBooking = (assetId, start, end, excludeId = null) => {
  const query = {
    asset_id: assetId,
    status: { $ne: BOOKING_STATUS.CANCELLED },
    start_datetime: { $lt: end },
    end_datetime: { $gt: start },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Booking.findOne(query).populate('employee_id', 'name email');
};

module.exports = { findOverlappingBooking };
