const mongoose = require('mongoose');
const { ACTIVE_STATUS, ACTIVE_STATUS_VALUES } = require('../config/constants');

const assetCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    // Free-form JSON for category-specific attributes,
    // e.g. { warranty_period: "2 years", voltage: "220V" }
    custom_fields: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Soft-delete flag: categories are deactivated rather than hard-deleted
    // so existing assets keep a valid reference.
    status: { type: String, enum: ACTIVE_STATUS_VALUES, default: ACTIVE_STATUS.ACTIVE },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
