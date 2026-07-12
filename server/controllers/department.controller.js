const Department = require('../models/Department');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { logActivity } = require('../services/activityLog.service');
const { ACTIVE_STATUS } = require('../config/constants');

/**
 * Ensures the proposed head is an existing, active employee.
 */
const assertValidHead = async (headId) => {
  if (!headId) return;
  const head = await Employee.findById(headId);
  if (!head) throw ApiError.badRequest('Head employee not found');
  if (head.status !== ACTIVE_STATUS.ACTIVE) {
    throw ApiError.badRequest('Head employee must be Active');
  }
};

/**
 * Walks the parent chain to guarantee that setting `parentId` as the parent of
 * `departmentId` does not create a cycle.
 */
const assertNoCircularParent = async (departmentId, parentId) => {
  if (!parentId) return;
  if (departmentId && String(parentId) === String(departmentId)) {
    throw ApiError.badRequest('A department cannot be its own parent');
  }
  let current = await Department.findById(parentId).select('parent_department_id');
  while (current) {
    if (departmentId && String(current._id) === String(departmentId)) {
      throw ApiError.badRequest('Circular department hierarchy is not allowed');
    }
    if (!current.parent_department_id) break;
    current = await Department.findById(current.parent_department_id).select('parent_department_id');
  }
};

/** POST /api/departments */
const createDepartment = asyncHandler(async (req, res) => {
  const { name, parent_department_id, head_employee_id } = req.body;

  await assertNoCircularParent(null, parent_department_id);
  await assertValidHead(head_employee_id);

  const department = await Department.create({
    name,
    parent_department_id: parent_department_id || null,
    head_employee_id: head_employee_id || null,
  });

  await logActivity({
    employeeId: req.user.id,
    action: 'DEPARTMENT_CREATED',
    entityType: 'Department',
    entityId: department._id,
    description: `Created department "${name}"`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Department created', data: department });
});

/** GET /api/departments */
const listDepartments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const departments = await Department.find(filter)
    .populate('parent_department_id', 'name')
    .populate('head_employee_id', 'name email')
    .sort({ name: 1 });

  return sendSuccess(res, { data: departments });
});

/** GET /api/departments/:id */
const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate('parent_department_id', 'name')
    .populate('head_employee_id', 'name email');
  if (!department) throw ApiError.notFound('Department not found');
  return sendSuccess(res, { data: department });
});

/** PUT /api/departments/:id */
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw ApiError.notFound('Department not found');

  const { name, parent_department_id, head_employee_id } = req.body;

  if (parent_department_id !== undefined) {
    await assertNoCircularParent(department._id, parent_department_id);
    department.parent_department_id = parent_department_id || null;
  }
  if (head_employee_id !== undefined) {
    await assertValidHead(head_employee_id);
    department.head_employee_id = head_employee_id || null;
  }
  if (name !== undefined) department.name = name;

  await department.save();

  await logActivity({
    employeeId: req.user.id,
    action: 'DEPARTMENT_UPDATED',
    entityType: 'Department',
    entityId: department._id,
    description: `Updated department "${department.name}"`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: 'Department updated', data: department });
});

/** PATCH /api/departments/:id/status */
const setDepartmentStatus = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!department) throw ApiError.notFound('Department not found');

  await logActivity({
    employeeId: req.user.id,
    action: 'DEPARTMENT_STATUS_CHANGED',
    entityType: 'Department',
    entityId: department._id,
    description: `Set department "${department.name}" to ${department.status}`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, { message: `Department ${department.status}`, data: department });
});

module.exports = {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  setDepartmentStatus,
};
