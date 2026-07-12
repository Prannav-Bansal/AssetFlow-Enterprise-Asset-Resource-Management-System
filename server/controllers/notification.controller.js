const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');

/** GET /api/notifications — current user's notifications, newest first. */
const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { employee_id: req.user.id };
  if (req.query.is_read !== undefined) filter.is_read = req.query.is_read === 'true';
  if (req.query.type) filter.type = req.query.type;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: notifications, meta: buildPaginationMeta(total, page, limit) });
});

/** GET /api/notifications/unread-count — badge count for the header. */
const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ employee_id: req.user.id, is_read: false });
  return sendSuccess(res, { data: { count } });
});

/** PATCH /api/notifications/:id/read */
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, employee_id: req.user.id },
    { is_read: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return sendSuccess(res, { message: 'Marked as read', data: notification });
});

/** PATCH /api/notifications/read-all */
const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { employee_id: req.user.id, is_read: false },
    { is_read: true }
  );
  return sendSuccess(res, { message: 'All notifications marked read', data: { updated: result.modifiedCount } });
});

module.exports = { listNotifications, unreadCount, markRead, markAllRead };
