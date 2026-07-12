const Asset = require('../models/Asset');
const AssetAllocation = require('../models/AssetAllocation');
const { ASSET_STATUS, ALLOCATION_STATUS } = require('../config/constants');

/**
 * Resolves the set of assets that fall within an audit cycle's scope.
 *  - scope_location  → assets whose location matches (case-insensitive).
 *  - scope_department → assets currently allocated to that department.
 *  - neither         → every asset that is not already disposed.
 */
const resolveScopedAssets = async (cycle) => {
  if (cycle.scope_location) {
    return Asset.find({ location: new RegExp(`^${cycle.scope_location}$`, 'i') }).select('_id');
  }

  if (cycle.scope_department_id) {
    const allocations = await AssetAllocation.find({
      department_id: cycle.scope_department_id,
      status: { $in: [ALLOCATION_STATUS.ACTIVE, ALLOCATION_STATUS.OVERDUE] },
    }).select('asset_id');
    const assetIds = allocations.map((a) => a.asset_id);
    return Asset.find({ _id: { $in: assetIds } }).select('_id');
  }

  return Asset.find({ status: { $ne: ASSET_STATUS.DISPOSED } }).select('_id');
};

module.exports = { resolveScopedAssets };
