const mongoose = require('mongoose');
const { ACTIVE_STATUS, ACTIVE_STATUS_VALUES } = require('../config/constants');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    parent_department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    head_employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: { type: String, enum: ACTIVE_STATUS_VALUES, default: ACTIVE_STATUS.ACTIVE },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Department', departmentSchema);
