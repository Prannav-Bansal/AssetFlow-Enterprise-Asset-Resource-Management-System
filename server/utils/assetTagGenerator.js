const Counter = require('../models/Counter');

const ASSET_TAG_PREFIX = 'AF';
const PAD_WIDTH = 4;

/**
 * Atomically generates the next asset tag, e.g. "AF-0001", "AF-0002".
 * Uses a dedicated Counter document so tags are sequential and unique even
 * under concurrent asset registrations.
 */
const generateAssetTag = async () => {
  const counter = await Counter.findByIdAndUpdate(
    'asset_tag',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(PAD_WIDTH, '0');
  return `${ASSET_TAG_PREFIX}-${padded}`;
};

module.exports = { generateAssetTag, ASSET_TAG_PREFIX };
