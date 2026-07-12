const mongoose = require('mongoose');

/**
 * Immutable audit trail of every mutating action in the system. Populated by
 * the activityLog middleware and, for richer context, directly by services.
 */
const activityLogSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  action: { type: String, required: true }, // e.g. "ASSET_CREATED", "ALLOCATION_RETURNED"
  entity_type: { type: String, required: true }, // e.g. "Asset", "Booking"
  entity_id: { type: mongoose.Schema.Types.ObjectId },
  description: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip_address: String,
  created_at: { type: Date, default: Date.now },
});

activityLogSchema.index({ created_at: -1 });
activityLogSchema.index({ employee_id: 1 });
activityLogSchema.index({ entity_type: 1, action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
