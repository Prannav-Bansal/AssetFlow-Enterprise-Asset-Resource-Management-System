const Notification = require('../models/Notification');
const { NOTIFICATION_TYPE } = require('../config/constants');

/**
 * Central place to create in-app notifications. Every module calls these
 * helpers so notification wording and typing stay consistent, and so a future
 * switch to email/websocket delivery only needs to change here.
 */

/**
 * Create a notification for a single employee.
 */
const notify = async ({ employeeId, title, message, type = NOTIFICATION_TYPE.OTHER }) => {
  if (!employeeId) return null;
  return Notification.create({ employee_id: employeeId, title, message, type });
};

/**
 * Create the same notification for several employees at once.
 * Duplicate / falsy recipients are removed.
 */
const notifyMany = async ({ employeeIds = [], title, message, type = NOTIFICATION_TYPE.OTHER }) => {
  const unique = [...new Set(employeeIds.filter(Boolean).map(String))];
  if (!unique.length) return [];
  return Notification.insertMany(
    unique.map((employee_id) => ({ employee_id, title, message, type }))
  );
};

module.exports = { notify, notifyMany };
