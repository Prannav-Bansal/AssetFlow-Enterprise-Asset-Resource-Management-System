const mongoose = require('mongoose');
const { ROLE_VALUES } = require('../config/constants');

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ROLE_VALUES, required: true, unique: true },
    description: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Role', roleSchema);
