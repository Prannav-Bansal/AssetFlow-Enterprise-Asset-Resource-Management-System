const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');

/**
 * GET /api/activity-logs — Admin-only searchable audit trail.
 * Filters: employee_id, action, entity_type, date range (from/to), search.
 */
const listLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  if (req.query.action) filter.action = req.query.action;
  if (req.query.entity_type) filter.entity_type = req.query.entity_type;
  if (req.query.search) filter.description = new RegExp(req.query.search.trim(), 'i');
  if (req.query.from || req.query.to) {
    filter.created_at = {};
    if (req.query.from) filter.created_at.$gte = new Date(req.query.from);
    if (req.query.to) filter.created_at.$lte = new Date(req.query.to);
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('employee_id', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: logs, meta: buildPaginationMeta(total, page, limit) });
});

module.exports = { listLogs };
