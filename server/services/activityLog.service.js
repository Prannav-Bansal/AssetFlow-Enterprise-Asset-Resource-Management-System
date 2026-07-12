const ActivityLog = require('../models/ActivityLog');

/**
 * Records an entry in the immutable activity/audit trail. Called directly from
 * controllers/services (rather than guessed by middleware) so each log line has
 * an accurate actor, entity id, and human-readable description.
 *
 * Logging must never break the primary request, so failures are swallowed and
 * only logged to the console.
 */
const logActivity = async ({
  employeeId,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
  ipAddress,
}) => {
  try {
    return await ActivityLog.create({
      employee_id: employeeId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      metadata,
      ip_address: ipAddress,
    });
  } catch (err) {
    console.error('⚠ Failed to write activity log:', err.message);
    return null;
  }
};

module.exports = { logActivity };
