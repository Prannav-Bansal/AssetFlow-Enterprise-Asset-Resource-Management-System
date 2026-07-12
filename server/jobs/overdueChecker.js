const AssetAllocation = require('../models/AssetAllocation');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const { notify, notifyMany } = require('../services/notification.service');
const { ALLOCATION_STATUS, NOTIFICATION_TYPE, ROLES } = require('../config/constants');

/**
 * Flags active allocations whose expected return date has passed as Overdue and
 * notifies both the holder and all Asset Managers. Runs hourly.
 */
const runOverdueCheck = async () => {
  const now = new Date();
  const overdue = await AssetAllocation.find({
    status: ALLOCATION_STATUS.ACTIVE,
    expected_return_date: { $lt: now },
  }).populate('asset_id', 'name asset_tag');

  if (!overdue.length) return { flagged: 0 };

  // Resolve Asset Manager recipients once for the whole batch.
  const managerRole = await Role.findOne({ name: ROLES.ASSET_MANAGER });
  const managers = managerRole
    ? await Employee.find({ role_id: managerRole._id, status: 'Active' }).select('_id')
    : [];
  const managerIds = managers.map((m) => m._id);

  for (const allocation of overdue) {
    allocation.status = ALLOCATION_STATUS.OVERDUE;
    await allocation.save();

    const assetLabel = allocation.asset_id
      ? `${allocation.asset_id.name} (${allocation.asset_id.asset_tag})`
      : 'An asset';

    await notify({
      employeeId: allocation.employee_id,
      title: 'Asset return overdue',
      message: `${assetLabel} was due on ${allocation.expected_return_date.toLocaleDateString()}. Please return it.`,
      type: NOTIFICATION_TYPE.RETURN,
    });
    await notifyMany({
      employeeIds: managerIds,
      title: 'Overdue asset',
      message: `${assetLabel} is overdue for return.`,
      type: NOTIFICATION_TYPE.RETURN,
    });
  }

  console.log(`⏰ overdueChecker: flagged ${overdue.length} allocation(s) as overdue`);
  return { flagged: overdue.length };
};

module.exports = { runOverdueCheck };
