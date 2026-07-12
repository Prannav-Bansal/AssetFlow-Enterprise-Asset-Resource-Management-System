const mongoose = require('mongoose');
const { BOOKING_STATUS, BOOKING_STATUS_VALUES } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    asset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    start_datetime: { type: Date, required: true },
    end_datetime: { type: Date, required: true },
    purpose: String,
    status: { type: String, enum: BOOKING_STATUS_VALUES, default: BOOKING_STATUS.CONFIRMED },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    photo_url: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Supports the overlap query: same asset, overlapping time window.
bookingSchema.index({ asset_id: 1, status: 1, start_datetime: 1, end_datetime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
