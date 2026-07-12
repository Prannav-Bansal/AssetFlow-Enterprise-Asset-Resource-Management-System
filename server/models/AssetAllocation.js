const mongoose = require('mongoose');
const { ALLOCATION_STATUS, ALLOCATION_STATUS_VALUES } = require('../config/constants');

const assetAllocationSchema = new mongoose.Schema(
  {
    asset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    allocated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    allocated_date: { type: Date, default: Date.now },
    expected_return_date: Date,
    returned_date: Date,
    status: { type: String, enum: ALLOCATION_STATUS_VALUES, default: ALLOCATION_STATUS.ACTIVE },
    condition_on_return: String,
    return_notes: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Fast lookups for the frequent "does this asset have an active allocation?" check.
assetAllocationSchema.index({ asset_id: 1, status: 1 });

module.exports = mongoose.model('AssetAllocation', assetAllocationSchema);
