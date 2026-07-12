const mongoose = require('mongoose');
const {
  ASSET_STATUS,
  ASSET_STATUS_VALUES,
  ASSET_CONDITION_VALUES,
} = require('../config/constants');

const assetSchema = new mongoose.Schema(
  {
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    asset_tag: { type: String, unique: true, required: true }, // auto-generated, e.g. AF-0001
    serial_number: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: String,
    is_bookable: { type: Boolean, default: false },
    condition: { type: String, enum: ASSET_CONDITION_VALUES },
    status: { type: String, enum: ASSET_STATUS_VALUES, default: ASSET_STATUS.AVAILABLE },
    location: String,
    acquisition_date: Date,
    acquisition_cost: Number,
    photo_url: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Asset', assetSchema);
