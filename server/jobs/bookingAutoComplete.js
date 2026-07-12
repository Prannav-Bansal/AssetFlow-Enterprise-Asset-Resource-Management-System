const Booking = require('../models/Booking');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * Marks confirmed bookings whose end time has passed as Completed. Runs hourly.
 */
const runBookingAutoComplete = async () => {
  const result = await Booking.updateMany(
    { status: BOOKING_STATUS.CONFIRMED, end_datetime: { $lt: new Date() } },
    { status: BOOKING_STATUS.COMPLETED }
  );

  if (result.modifiedCount) {
    console.log(`✅ bookingAutoComplete: completed ${result.modifiedCount} past booking(s)`);
  }
  return { completed: result.modifiedCount };
};

module.exports = { runBookingAutoComplete };
