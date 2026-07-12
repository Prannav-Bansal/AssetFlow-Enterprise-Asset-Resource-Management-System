const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ACTIVE_STATUS, ACTIVE_STATUS_VALUES } = require('../config/constants');

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, required: true, select: false },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    status: { type: String, enum: ACTIVE_STATUS_VALUES, default: ACTIVE_STATUS.ACTIVE },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

/**
 * Hashes a plaintext password. Static helper so seed scripts and the auth
 * service share one implementation.
 */
employeeSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

/**
 * Compares a candidate plaintext password against this employee's hash.
 * Requires the document to have been loaded with `.select('+password_hash')`.
 */
employeeSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password_hash);
};

module.exports = mongoose.model('Employee', employeeSchema);
