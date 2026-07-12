const Employee = require('../models/Employee');
const Role = require('../models/Role');
const AssetAllocation = require('../models/AssetAllocation');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/responseHelper');
const { getPagination } = require('../utils/query');
const { logActivity } = require('../services/activityLog.service');
const { ALLOCATION_STATUS } = require('../config/constants');

/**
 * GET /api/employees
 * Filterable directory. Supports department, role (by name), status, and a free
 * text search across name/email.
 */
const listEmployees = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.department_id) filter.department_id = req.query.department_id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) {
    const role = await Role.findOne({ name: req.query.role });
    filter.role_id = role ? role._id : null;
  }
  if (req.query.search) {
    const rx = new RegExp(req.query.search.trim(), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('role_id', 'name')
      .populate('department_id', 'name')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: employees, meta: buildPaginationMeta(total, page, limit) });
});

/**
 * GET /api/employees/:id
 * Detail view including the employee's currently held assets.
 */
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('role_id', 'name')
    .populate('department_id', 'name');
  if (!employee) throw ApiError.notFound('Employee not found');

  const allocations = await AssetAllocation.find({
    employee_id: employee._id,
    status: { $ne: ALLOCATION_STATUS.RETURNED },
  }).populate('asset_id', 'name asset_tag status');

  return sendSuccess(res, { data: { employee, current_allocations: allocations } });
});

/** PUT /api/employees/:id */
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('role_id', 'name');
  if (!employee) throw ApiError.notFound('Employee not found');

  await logActivity({
    employeeId: req.user.id,
    action: 'EMPLOYEE_UPDATED',
    entityType: 'Employee',
    entityId: employee._id,
    description: `Updated employee "${employee.name}"`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Employee updated', data: employee });
});

/**
 * PATCH /api/employees/:id/role — Admin-only role assignment.
 */
const setEmployeeRole = asyncHandler(async (req, res) => {
  const role = await Role.findOne({ name: req.body.role });
  if (!role) throw ApiError.badRequest('Unknown role');

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { role_id: role._id },
    { new: true }
  ).populate('role_id', 'name');
  if (!employee) throw ApiError.notFound('Employee not found');

  await logActivity({
    employeeId: req.user.id,
    action: 'EMPLOYEE_ROLE_CHANGED',
    entityType: 'Employee',
    entityId: employee._id,
    description: `Set ${employee.name}'s role to ${role.name}`,
    metadata: { role: role.name },
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: `Role set to ${role.name}`, data: employee });
});

/** PATCH /api/employees/:id/status */
const setEmployeeStatus = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).populate('role_id', 'name');
  if (!employee) throw ApiError.notFound('Employee not found');

  await logActivity({
    employeeId: req.user.id,
    action: 'EMPLOYEE_STATUS_CHANGED',
    entityType: 'Employee',
    entityId: employee._id,
    description: `Set ${employee.name} to ${employee.status}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: `Employee ${employee.status}`, data: employee });
});

module.exports = {
  listEmployees,
  getEmployee,
  updateEmployee,
  setEmployeeRole,
  setEmployeeStatus,
};
