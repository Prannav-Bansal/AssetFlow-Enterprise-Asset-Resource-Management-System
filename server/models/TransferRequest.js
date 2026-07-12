const mongoose = require('mongoose');
const { TRANSFER_STATUS, TRANSFER_STATUS_VALUES } = require('../config/constants');

const transferRequestSchema = new mongoose.Schema({
  allocation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetAllocation', required: true },
  from_employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  to_employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: { type: String, enum: TRANSFER_STATUS_VALUES, default: TRANSFER_STATUS.REQUESTED },
  requested_at: { type: Date, default: Date.now },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approved_at: Date,
  remarks: String,
});

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
