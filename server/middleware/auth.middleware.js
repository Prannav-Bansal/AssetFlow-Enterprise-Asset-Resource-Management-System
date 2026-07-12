const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/token');
const { ACTIVE_STATUS } = require('../config/constants');

/**
 * Authenticates a request via the `Authorization: Bearer <token>` header.
 * On success attaches `req.user = { id, role, department, name, email }`.
 *
 * The employee is re-loaded on every request so a deactivated or role-changed
 * account loses access immediately, without waiting for the token to expire.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice(7).trim();

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  const employee = await Employee.findById(decoded.id).populate('role_id', 'name');
  if (!employee) throw ApiError.unauthorized('Account no longer exists');
  if (employee.status !== ACTIVE_STATUS.ACTIVE) {
    throw ApiError.forbidden('Account is inactive');
  }

  req.user = {
    id: employee._id,
    name: employee.name,
    email: employee.email,
    role: employee.role_id ? employee.role_id.name : null,
    department: employee.department_id || null,
  };

  next();
});

module.exports = { authenticate };
