const Booking = require('../models/Booking');
const { notify } = require('../services/notification.service');
const { BOOKING_STATUS, NOTIFICATION_TYPE } = require('../config/constants');

// Track which bookings we've already reminded about, so a booking isn't
// reminded twice while it sits inside the 30-minute window across job runs.
const remindedBookingIds = new Set();

/**
 * Notifies bookers about confirmed bookings starting within the next 30 minutes.
 * Runs every 15 minutes.
 */
const runBookingReminder = async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 60 * 1000);

  const upcoming = await Booking.find({
    status: BOOKING_STATUS.CONFIRMED,
    start_datetime: { $gte: now, $lte: soon },
  }).populate('asset_id', 'name asset_tag');

  let sent = 0;
  for (const booking of upcoming) {
    const key = booking._id.toString();
    if (remindedBookingIds.has(key)) continue;

    await notify({
      employeeId: booking.employee_id,
      title: 'Booking starting soon',
      message: `Your booking for ${booking.asset_id?.name} starts at ${booking.start_datetime.toLocaleTimeString()}.`,
      type: NOTIFICATION_TYPE.BOOKING,
    });
    remindedBookingIds.add(key);
    sent += 1;
  }

  if (sent) console.log(`🔔 bookingReminder: sent ${sent} reminder(s)`);
  return { sent };
};

module.exports = { runBookingReminder };
