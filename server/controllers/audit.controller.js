const AuditCycle = require('../models/AuditCycle');
const AuditRecord = require('../models/AuditRecord');
const Asset = require('../models/Asset');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { resolveScopedAssets } = require('../services/audit.service');
const { resolveFileUrl } = require('../middleware/upload.middleware');
const { notifyMany } = require('../services/notification.service');
const { logActivity } = require('../services/activityLog.service');
const {
  AUDIT_CYCLE_STATUS,
  AUDIT_RESULT,
  ASSET_STATUS,
  NOTIFICATION_TYPE,
} = require('../config/constants');

/** POST /api/audits/cycles */
const createCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.create({ ...req.body, created_by: req.user.id });

  await logActivity({
    employeeId: req.user.id,
    action: 'AUDIT_CYCLE_CREATED',
    entityType: 'AuditCycle',
    entityId: cycle._id,
    description: `Created audit cycle "${cycle.name}"`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Audit cycle created', data: cycle });
});

/** GET /api/audits/cycles */
const listCycles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const cycles = await AuditCycle.find(filter)
    .populate('scope_department_id', 'name')
    .populate('auditors', 'name')
    .sort({ created_at: -1 });
  return sendSuccess(res, { data: cycles });
});

/** GET /api/audits/cycles/:id — cycle with progress summary. */
const getCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id)
    .populate('scope_department_id', 'name')
    .populate('auditors', 'name email')
    .populate('created_by', 'name');
  if (!cycle) throw ApiError.notFound('Audit cycle not found');

  const [total, recorded] = await Promise.all([
    AuditRecord.countDocuments({ audit_cycle_id: cycle._id }),
    AuditRecord.countDocuments({ audit_cycle_id: cycle._id, result: { $ne: null } }),
  ]);

  return sendSuccess(res, {
    data: { cycle, progress: { total, recorded, pending: total - recorded } },
  });
});

/**
 * PATCH /api/audits/cycles/:id/start
 * Moves the cycle to In Progress and generates one blank AuditRecord per
 * in-scope asset (idempotent thanks to the unique cycle+asset index).
 */
const startCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id);
  if (!cycle) throw ApiError.notFound('Audit cycle not found');
  if (cycle.status !== AUDIT_CYCLE_STATUS.PLANNED) {
    throw ApiError.badRequest(`Only planned cycles can be started (currently ${cycle.status})`);
  }

  const assets = await resolveScopedAssets(cycle);
  if (!assets.length) throw ApiError.badRequest('No assets fall within this cycle scope');

  // insertMany with ordered:false so a re-run skips duplicates instead of failing.
  const records = assets.map((a) => ({ audit_cycle_id: cycle._id, asset_id: a._id }));
  await AuditRecord.insertMany(records, { ordered: false }).catch((err) => {
    if (err.code !== 11000) throw err; // ignore duplicate-key on re-start
  });

  cycle.status = AUDIT_CYCLE_STATUS.IN_PROGRESS;
  await cycle.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'AUDIT_CYCLE_STARTED',
    entityType: 'AuditCycle',
    entityId: cycle._id,
    description: `Started cycle "${cycle.name}" with ${assets.length} assets`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, {
    message: `Cycle started with ${assets.length} assets`,
    data: cycle,
  });
});

/** POST /api/audits/cycles/:id/assign — set the auditor list. */
const assignAuditors = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findByIdAndUpdate(
    req.params.id,
    { auditors: req.body.auditors },
    { new: true }
  ).populate('auditors', 'name');
  if (!cycle) throw ApiError.notFound('Audit cycle not found');

  await notifyMany({
    employeeIds: req.body.auditors,
    title: 'Audit assignment',
    message: `You have been assigned to audit cycle "${cycle.name}".`,
    type: NOTIFICATION_TYPE.AUDIT,
  });

  return sendSuccess(res, { message: 'Auditors assigned', data: cycle });
});

/** GET /api/audits/cycles/:id/records — checklist of records for auditors. */
const listRecords = asyncHandler(async (req, res) => {
  const records = await AuditRecord.find({ audit_cycle_id: req.params.id })
    .populate('asset_id', 'name asset_tag location status')
    .populate('auditor_id', 'name')
    .sort({ recorded_at: 1 });
  return sendSuccess(res, { data: records });
});

/** PATCH /api/audits/records/:id — record an audit result for one asset. */
const recordResult = asyncHandler(async (req, res) => {
  const record = await AuditRecord.findById(req.params.id).populate('audit_cycle_id', 'status');
  if (!record) throw ApiError.notFound('Audit record not found');
  if (record.audit_cycle_id.status !== AUDIT_CYCLE_STATUS.IN_PROGRESS) {
    throw ApiError.badRequest('Results can only be recorded while the cycle is In Progress');
  }

  record.result = req.body.result;
  record.remarks = req.body.remarks;
  record.auditor_id = req.user.id;
  record.recorded_at = new Date();
  record.photo_url = resolveFileUrl(req) || record.photo_url;
  await record.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'AUDIT_RESULT_RECORDED',
    entityType: 'AuditRecord',
    entityId: record._id,
    description: `Recorded ${record.result}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Result recorded', data: record });
});

/** PATCH /api/audits/cycles/:id/complete */
const completeCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id);
  if (!cycle) throw ApiError.notFound('Audit cycle not found');
  if (cycle.status !== AUDIT_CYCLE_STATUS.IN_PROGRESS) {
    throw ApiError.badRequest('Only in-progress cycles can be completed');
  }

  cycle.status = AUDIT_CYCLE_STATUS.COMPLETED;
  await cycle.save();

  const discrepancies = await AuditRecord.countDocuments({
    audit_cycle_id: cycle._id,
    result: { $nin: [null, AUDIT_RESULT.VERIFIED] },
  });

  await logActivity({
    employeeId: req.user.id,
    action: 'AUDIT_CYCLE_COMPLETED',
    entityType: 'AuditCycle',
    entityId: cycle._id,
    description: `Completed cycle "${cycle.name}" (${discrepancies} discrepancies)`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Cycle completed', data: { cycle, discrepancies } });
});

/**
 * PATCH /api/audits/cycles/:id/close
 * Locks the cycle and applies discrepancy outcomes to asset statuses:
 *   Missing → Lost, Damaged/Not Working → Under Maintenance.
 * Notifies the auditors of each affected asset.
 */
const closeCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id);
  if (!cycle) throw ApiError.notFound('Audit cycle not found');
  if (cycle.status !== AUDIT_CYCLE_STATUS.COMPLETED) {
    throw ApiError.badRequest('Only completed cycles can be closed');
  }

  const discrepancies = await AuditRecord.find({
    audit_cycle_id: cycle._id,
    result: { $nin: [null, AUDIT_RESULT.VERIFIED] },
  }).populate('asset_id', 'asset_tag status');

  const statusMap = {
    [AUDIT_RESULT.MISSING]: ASSET_STATUS.LOST,
    [AUDIT_RESULT.DAMAGED]: ASSET_STATUS.UNDER_MAINTENANCE,
    [AUDIT_RESULT.NOT_WORKING]: ASSET_STATUS.UNDER_MAINTENANCE,
  };

  let affected = 0;
  for (const record of discrepancies) {
    const target = statusMap[record.result];
    if (target && record.asset_id) {
      await Asset.findByIdAndUpdate(record.asset_id._id, { status: target });
      affected += 1;
    }
  }

  cycle.status = AUDIT_CYCLE_STATUS.CLOSED;
  await cycle.save();

  await notifyMany({
    employeeIds: cycle.auditors,
    title: 'Audit cycle closed',
    message: `"${cycle.name}" closed with ${discrepancies.length} discrepancies; ${affected} asset statuses updated.`,
    type: NOTIFICATION_TYPE.AUDIT,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'AUDIT_CYCLE_CLOSED',
    entityType: 'AuditCycle',
    entityId: cycle._id,
    description: `Closed cycle "${cycle.name}"; updated ${affected} asset statuses`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, {
    message: 'Cycle closed',
    data: { cycle, discrepancies: discrepancies.length, assets_updated: affected },
  });
});

/** GET /api/audits/cycles/:id/report — flagged (non-Verified) records only. */
const getReport = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id).select('name status');
  if (!cycle) throw ApiError.notFound('Audit cycle not found');

  const flagged = await AuditRecord.find({
    audit_cycle_id: req.params.id,
    result: { $nin: [null, AUDIT_RESULT.VERIFIED] },
  })
    .populate('asset_id', 'name asset_tag location')
    .populate('auditor_id', 'name');

  return sendSuccess(res, { data: { cycle, discrepancies: flagged } });
});

module.exports = {
  createCycle,
  listCycles,
  getCycle,
  startCycle,
  assignAuditors,
  listRecords,
  recordResult,
  completeCycle,
  closeCycle,
  getReport,
};
