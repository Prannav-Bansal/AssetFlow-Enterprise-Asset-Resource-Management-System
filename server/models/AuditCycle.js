const mongoose = require('mongoose');
const { AUDIT_CYCLE_STATUS, AUDIT_CYCLE_STATUS_VALUES } = require('../config/constants');

const auditCycleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    scope_department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    scope_location: { type: String, default: null },
    start_date: Date,
    end_date: Date,
    status: { type: String, enum: AUDIT_CYCLE_STATUS_VALUES, default: AUDIT_CYCLE_STATUS.PLANNED },
    // Auditors assigned to carry out this cycle.
    auditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('AuditCycle', auditCycleSchema);
