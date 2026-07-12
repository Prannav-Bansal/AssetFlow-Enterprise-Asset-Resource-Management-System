const cron = require('node-cron');
const { runOverdueCheck } = require('./overdueChecker');
const { runBookingReminder } = require('./bookingReminder');
const { runBookingAutoComplete } = require('./bookingAutoComplete');

/**
 * Wraps a job so an unexpected error is logged but never crashes the scheduler.
 */
const safe = (name, fn) => async () => {
  try {
    await fn();
  } catch (err) {
    console.error(`✗ Cron job "${name}" failed:`, err.message);
  }
};

/**
 * Registers all background cron jobs. Disabled when DISABLE_CRON=true (useful
 * for tests or when running multiple instances where only one should schedule).
 */
const startJobs = () => {
  if (process.env.DISABLE_CRON === 'true') {
    console.log('⏸ Cron jobs disabled via DISABLE_CRON');
    return;
  }

  // Overdue allocations — every hour.
  cron.schedule('0 * * * *', safe('overdueChecker', runOverdueCheck));

  // Booking reminders — every 15 minutes.
  cron.schedule('*/15 * * * *', safe('bookingReminder', runBookingReminder));

  // Auto-complete past bookings — every hour.
  cron.schedule('0 * * * *', safe('bookingAutoComplete', runBookingAutoComplete));

  console.log('✓ Background cron jobs registered');
};

module.exports = { startJobs };
