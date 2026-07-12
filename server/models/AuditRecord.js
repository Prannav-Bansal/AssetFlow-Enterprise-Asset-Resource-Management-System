const mongoose = require('mongoose');
const { AUDIT_RESULT_VALUES } = require('../config/constants');

const auditRecordSchema = new mongoose.Schema({
  audit_cycle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditCycle', required: true },
  asset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  // Auditor is filled in when the result is recorded (blank records are
  // pre-generated when a cycle starts).
  auditor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  result: { type: String, enum: AUDIT_RESULT_VALUES, default: null },
  remarks: String,
  recorded_at: Date,
  photo_url: String,
});

auditRecordSchema.index({ audit_cycle_id: 1, asset_id: 1 }, { unique: true });

module.exports = mongoose.model('AuditRecord', auditRecordSchema);
