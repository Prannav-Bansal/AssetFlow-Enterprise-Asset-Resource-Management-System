const mongoose = require('mongoose');
const { NOTIFICATION_TYPE, NOTIFICATION_TYPE_VALUES } = require('../config/constants');

const notificationSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  message: String,
  type: { type: String, enum: NOTIFICATION_TYPE_VALUES, default: NOTIFICATION_TYPE.OTHER },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

// Header badge and feed both query by recipient + read state.
notificationSchema.index({ employee_id: 1, is_read: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
