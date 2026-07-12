const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');
const { resolveFileUrl } = require('../middleware/upload.middleware');
const { notify } = require('../services/notification.service');
const { logActivity } = require('../services/activityLog.service');
const {
  MAINTENANCE_STATUS,
  ASSET_STATUS,
  NOTIFICATION_TYPE,
} = require('../config/constants');

/** Loads a maintenance request or throws 404. */
const loadRequest = async (id) => {
  const request = await MaintenanceRequest.findById(id).populate('asset_id');
  if (!request) throw ApiError.notFound('Maintenance request not found');
  return request;
};

/**
 * POST /api/maintenance
 * Any employee can raise a maintenance request against an asset.
 */
const createRequest = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.body.asset_id);
  if (!asset) throw ApiError.notFound('Asset not found');

  const request = await MaintenanceRequest.create({
    asset_id: req.body.asset_id,
    issue_description: req.body.issue_description,
    priority: req.body.priority,
    requested_by: req.user.id,
    photo_url: resolveFileUrl(req),
  });

  await logActivity({
    employeeId: req.user.id,
    action: 'MAINTENANCE_REQUESTED',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: `Raised maintenance for ${asset.asset_tag}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Maintenance request raised', data: request });
});

/** GET /api/maintenance */
const listRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.asset_id) filter.asset_id = req.query.asset_id;
  if (req.query.technician_id) filter.technician_id = req.query.technician_id;

  const [requests, total] = await Promise.all([
    MaintenanceRequest.find(filter)
      .populate('asset_id', 'name asset_tag status')
      .populate('requested_by', 'name')
      .populate('technician_id', 'name')
      .sort({ requested_at: -1 })
      .skip(skip)
      .limit(limit),
    MaintenanceRequest.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: requests, meta: buildPaginationMeta(total, page, limit) });
});

/** GET /api/maintenance/:id */
const getRequest = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id)
    .populate('asset_id', 'name asset_tag status')
    .populate('requested_by', 'name email')
    .populate('approved_by', 'name')
    .populate('technician_id', 'name email');
  if (!request) throw ApiError.notFound('Maintenance request not found');
  return sendSuccess(res, { data: request });
});

/**
 * PATCH /api/maintenance/:id/approve
 * Approves the request and moves the asset into "Under Maintenance".
 */
const approveRequest = asyncHandler(async (req, res) => {
  const request = await loadRequest(req.params.id);
  if (request.status !== MAINTENANCE_STATUS.PENDING_APPROVAL) {
    throw ApiError.badRequest(`Cannot approve a request that is ${request.status}`);
  }

  request.status = MAINTENANCE_STATUS.APPROVED;
  request.approved_by = req.user.id;
  request.approved_at = new Date();
  await request.save();

  if (request.asset_id) {
    request.asset_id.status = ASSET_STATUS.UNDER_MAINTENANCE;
    await request.asset_id.save();
  }

  await notify({
    employeeId: request.requested_by,
    title: 'Maintenance approved',
    message: 'Your maintenance request has been approved.',
    type: NOTIFICATION_TYPE.MAINTENANCE,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'MAINTENANCE_APPROVED',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Approved maintenance request',
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Maintenance approved', data: request });
});

/** PATCH /api/maintenance/:id/reject */
const rejectRequest = asyncHandler(async (req, res) => {
  const request = await loadRequest(req.params.id);
  if (request.status !== MAINTENANCE_STATUS.PENDING_APPROVAL) {
    throw ApiError.badRequest(`Cannot reject a request that is ${request.status}`);
  }

  request.status = MAINTENANCE_STATUS.REJECTED;
  request.approved_by = req.user.id;
  request.approved_at = new Date();
  request.resolution_notes = req.body.resolution_notes;
  await request.save();

  await notify({
    employeeId: request.requested_by,
    title: 'Maintenance rejected',
    message: `Your maintenance request was rejected. ${req.body.resolution_notes || ''}`.trim(),
    type: NOTIFICATION_TYPE.MAINTENANCE,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'MAINTENANCE_REJECTED',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Rejected maintenance request',
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Maintenance rejected', data: request });
});

/** PATCH /api/maintenance/:id/assign — assign a technician, move to In Progress. */
const assignTechnician = asyncHandler(async (req, res) => {
  const request = await loadRequest(req.params.id);
  if (![MAINTENANCE_STATUS.APPROVED, MAINTENANCE_STATUS.IN_PROGRESS].includes(request.status)) {
    throw ApiError.badRequest('Only approved requests can be assigned');
  }

  const technician = await Employee.findById(req.body.technician_id);
  if (!technician) throw ApiError.badRequest('Technician not found');

  request.technician_id = technician._id;
  request.status = MAINTENANCE_STATUS.IN_PROGRESS;
  await request.save();

  await notify({
    employeeId: technician._id,
    title: 'Maintenance assigned to you',
    message: `You have been assigned a maintenance task for ${request.asset_id?.name}.`,
    type: NOTIFICATION_TYPE.MAINTENANCE,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'MAINTENANCE_ASSIGNED',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: `Assigned to ${technician.name}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Technician assigned', data: request });
});

/** PATCH /api/maintenance/:id/resolve — mark resolved, free the asset. */
const resolveRequest = asyncHandler(async (req, res) => {
  const request = await loadRequest(req.params.id);
  if (request.status !== MAINTENANCE_STATUS.IN_PROGRESS) {
    throw ApiError.badRequest('Only in-progress requests can be resolved');
  }

  request.status = MAINTENANCE_STATUS.RESOLVED;
  request.resolved_at = new Date();
  request.resolution_notes = req.body.resolution_notes;
  await request.save();

  // Free the asset only if it is still under maintenance (not allocated elsewhere).
  if (request.asset_id && request.asset_id.status === ASSET_STATUS.UNDER_MAINTENANCE) {
    request.asset_id.status = ASSET_STATUS.AVAILABLE;
    await request.asset_id.save();
  }

  await notify({
    employeeId: request.requested_by,
    title: 'Maintenance resolved',
    message: 'Your maintenance request has been resolved.',
    type: NOTIFICATION_TYPE.MAINTENANCE,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'MAINTENANCE_RESOLVED',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Resolved maintenance request',
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Maintenance resolved', data: request });
});

/** PATCH /api/maintenance/:id/close — final closure. */
const closeRequest = asyncHandler(async (req, res) => {
  const request = await loadRequest(req.params.id);
  if (request.status !== MAINTENANCE_STATUS.RESOLVED) {
    throw ApiError.badRequest('Only resolved requests can be closed');
  }
  request.status = MAINTENANCE_STATUS.CLOSED;
  await request.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'MAINTENANCE_CLOSED',
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Closed maintenance request',
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Maintenance closed', data: request });
});

module.exports = {
  createRequest,
  listRequests,
  getRequest,
  approveRequest,
  rejectRequest,
  assignTechnician,
  resolveRequest,
  closeRequest,
};
