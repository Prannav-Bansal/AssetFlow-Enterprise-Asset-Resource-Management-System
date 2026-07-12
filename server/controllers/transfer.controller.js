const AssetAllocation = require('../models/AssetAllocation');
const TransferRequest = require('../models/TransferRequest');
const Employee = require('../models/Employee');
const Asset = require('../models/Asset');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');
const { notify } = require('../services/notification.service');
const { logActivity } = require('../services/activityLog.service');
const {
  ALLOCATION_STATUS,
  TRANSFER_STATUS,
  ASSET_STATUS,
  NOTIFICATION_TYPE,
} = require('../config/constants');

/**
 * POST /api/transfers
 * Requests transfer of an actively-allocated asset to another employee.
 */
const createTransfer = asyncHandler(async (req, res) => {
  const { allocation_id, to_employee_id, remarks } = req.body;

  const allocation = await AssetAllocation.findById(allocation_id).populate('asset_id', 'asset_tag name');
  if (!allocation) throw ApiError.notFound('Allocation not found');
  if (allocation.status !== ALLOCATION_STATUS.ACTIVE && allocation.status !== ALLOCATION_STATUS.OVERDUE) {
    throw ApiError.badRequest('Only active allocations can be transferred');
  }

  const toEmployee = await Employee.findById(to_employee_id);
  if (!toEmployee) throw ApiError.badRequest('Target employee not found');
  if (String(to_employee_id) === String(allocation.employee_id)) {
    throw ApiError.badRequest('Asset is already held by this employee');
  }

  // Prevent duplicate open requests on the same allocation.
  const openRequest = await TransferRequest.findOne({
    allocation_id,
    status: TRANSFER_STATUS.REQUESTED,
  });
  if (openRequest) throw ApiError.conflict('A transfer request is already pending for this allocation');

  const transfer = await TransferRequest.create({
    allocation_id,
    from_employee_id: allocation.employee_id,
    to_employee_id,
    requested_by: req.user.id,
  });
  if (remarks) {
    transfer.remarks = remarks;
    await transfer.save();
  }

  await notify({
    employeeId: to_employee_id,
    title: 'Incoming asset transfer',
    message: `A transfer of ${allocation.asset_id?.name} is pending approval.`,
    type: NOTIFICATION_TYPE.OTHER,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'TRANSFER_REQUESTED',
    entityType: 'TransferRequest',
    entityId: transfer._id,
    description: `Requested transfer of ${allocation.asset_id?.asset_tag} to ${toEmployee.name}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Transfer requested', data: transfer });
});

/** GET /api/transfers */
const listTransfers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [transfers, total] = await Promise.all([
    TransferRequest.find(filter)
      .populate('from_employee_id', 'name')
      .populate('to_employee_id', 'name')
      .populate('requested_by', 'name')
      .populate({ path: 'allocation_id', populate: { path: 'asset_id', select: 'name asset_tag' } })
      .sort({ requested_at: -1 })
      .skip(skip)
      .limit(limit),
    TransferRequest.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: transfers, meta: buildPaginationMeta(total, page, limit) });
});

/**
 * PATCH /api/transfers/:id/approve
 * Closes the old allocation and opens a fresh one for the target employee.
 */
const approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) throw ApiError.notFound('Transfer request not found');
  if (transfer.status !== TRANSFER_STATUS.REQUESTED) {
    throw ApiError.badRequest(`Transfer is already ${transfer.status}`);
  }

  const oldAllocation = await AssetAllocation.findById(transfer.allocation_id);
  if (!oldAllocation) throw ApiError.badRequest('Original allocation no longer exists');

  // Close the old allocation.
  oldAllocation.status = ALLOCATION_STATUS.RETURNED;
  oldAllocation.returned_date = new Date();
  oldAllocation.return_notes = 'Closed by asset transfer';
  await oldAllocation.save();

  // Open a new allocation for the recipient.
  const newAllocation = await AssetAllocation.create({
    asset_id: oldAllocation.asset_id,
    employee_id: transfer.to_employee_id,
    department_id: oldAllocation.department_id,
    allocated_by: req.user.id,
    expected_return_date: oldAllocation.expected_return_date,
  });

  await Asset.findByIdAndUpdate(oldAllocation.asset_id, { status: ASSET_STATUS.ALLOCATED });

  transfer.status = TRANSFER_STATUS.APPROVED;
  transfer.approved_by = req.user.id;
  transfer.approved_at = new Date();
  await transfer.save();

  await notify({
    employeeId: transfer.to_employee_id,
    title: 'Transfer approved',
    message: 'An asset has been transferred to you.',
    type: NOTIFICATION_TYPE.OTHER,
  });
  await notify({
    employeeId: transfer.from_employee_id,
    title: 'Transfer completed',
    message: 'Your asset has been transferred to another employee.',
    type: NOTIFICATION_TYPE.OTHER,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'TRANSFER_APPROVED',
    entityType: 'TransferRequest',
    entityId: transfer._id,
    description: 'Approved asset transfer',
    metadata: { new_allocation: newAllocation._id },
    ipAddress: req.ip,
  });

  return sendSuccess(res, {
    message: 'Transfer approved',
    data: { transfer, new_allocation: newAllocation },
  });
});

/** PATCH /api/transfers/:id/reject */
const rejectTransfer = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) throw ApiError.notFound('Transfer request not found');
  if (transfer.status !== TRANSFER_STATUS.REQUESTED) {
    throw ApiError.badRequest(`Transfer is already ${transfer.status}`);
  }

  transfer.status = TRANSFER_STATUS.REJECTED;
  transfer.approved_by = req.user.id;
  transfer.approved_at = new Date();
  transfer.remarks = req.body.remarks || transfer.remarks;
  await transfer.save();

  await notify({
    employeeId: transfer.requested_by,
    title: 'Transfer rejected',
    message: `Your transfer request was rejected. ${transfer.remarks || ''}`.trim(),
    type: NOTIFICATION_TYPE.OTHER,
  });
  await logActivity({
    employeeId: req.user.id,
    action: 'TRANSFER_REJECTED',
    entityType: 'TransferRequest',
    entityId: transfer._id,
    description: 'Rejected asset transfer',
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Transfer rejected', data: transfer });
});

module.exports = { createTransfer, listTransfers, approveTransfer, rejectTransfer };
