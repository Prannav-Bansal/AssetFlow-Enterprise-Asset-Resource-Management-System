const mongoose = require('mongoose');
const {
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_VALUES,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_PRIORITY_VALUES,
} = require('../config/constants');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    issue_description: { type: String, required: true },
    priority: {
      type: String,
      enum: MAINTENANCE_PRIORITY_VALUES,
      default: MAINTENANCE_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: MAINTENANCE_STATUS_VALUES,
      default: MAINTENANCE_STATUS.PENDING_APPROVAL,
    },
    photo_url: String,
    requested_at: { type: Date, default: Date.now },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    technician_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approved_at: Date,
    resolved_at: Date,
    resolution_notes: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
