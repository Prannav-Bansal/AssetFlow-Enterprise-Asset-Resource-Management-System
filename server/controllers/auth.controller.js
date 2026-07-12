const crypto = require('crypto');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const UserSession = require('../models/UserSession');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/token');
const { logActivity } = require('../services/activityLog.service');
const { ROLES, ACTIVE_STATUS } = require('../config/constants');

/**
 * Loads an employee with role populated and returns the identity payload we
 * embed in the access token / send to the client.
 */
const buildAuthPayload = (employee) => ({
  id: employee._id,
  name: employee.name,
  email: employee.email,
  role: employee.role_id?.name || null,
  department: employee.department_id || null,
  status: employee.status,
});

/**
 * Issues an access + refresh token pair and persists a hashed refresh token as
 * a UserSession row.
 */
const issueSession = async (employee, req) => {
  const accessToken = signAccessToken({ id: employee._id.toString() });
  const refreshToken = signRefreshToken({ id: employee._id.toString() });

  await UserSession.create({
    employee_id: employee._id,
    token: hashToken(refreshToken),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/signup
 * Public self-registration. Always assigned the 'Employee' role — privileged
 * roles can only be granted by an Admin afterwards.
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, department_id } = req.body;

  const existing = await Employee.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const employeeRole = await Role.findOne({ name: ROLES.EMPLOYEE });
  if (!employeeRole) {
    throw ApiError.badRequest('Roles are not seeded. Run `npm run seed` first.');
  }

  const password_hash = await Employee.hashPassword(password);
  const employee = await Employee.create({
    name,
    email,
    password_hash,
    department_id: department_id || null,
    role_id: employeeRole._id,
  });

  await employee.populate('role_id', 'name');
  const tokens = await issueSession(employee, req);

  await logActivity({
    employeeId: employee._id,
    action: 'EMPLOYEE_SIGNUP',
    entityType: 'Employee',
    entityId: employee._id,
    description: `${employee.name} registered an account`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: { user: buildAuthPayload(employee), ...tokens },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const employee = await Employee.findOne({ email })
    .select('+password_hash')
    .populate('role_id', 'name');

  if (!employee) throw ApiError.unauthorized('Invalid email or password');
  if (employee.status !== ACTIVE_STATUS.ACTIVE) throw ApiError.forbidden('Account is inactive');

  const match = await employee.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const tokens = await issueSession(employee, req);

  await logActivity({
    employeeId: employee._id,
    action: 'EMPLOYEE_LOGIN',
    entityType: 'Employee',
    entityId: employee._id,
    description: `${employee.name} logged in`,
    ipAddress: req.ip,
  });

  return sendSuccess(res, {
    message: 'Logged in successfully',
    data: { user: buildAuthPayload(employee), ...tokens },
  });
});

/**
 * POST /api/auth/refresh
 * Rotates the refresh token: the presented session is closed and a fresh pair
 * is issued, so a stolen refresh token cannot be reused after a rotation.
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const hashed = hashToken(refreshToken);
  const session = await UserSession.findOne({ token: hashed, logout_at: null });
  if (!session) throw ApiError.unauthorized('Session not found or already ended');

  const employee = await Employee.findById(decoded.id).populate('role_id', 'name');
  if (!employee || employee.status !== ACTIVE_STATUS.ACTIVE) {
    throw ApiError.unauthorized('Account is unavailable');
  }

  // Rotate: end the old session, open a new one.
  session.logout_at = new Date();
  await session.save();
  const tokens = await issueSession(employee, req);

  return sendSuccess(res, {
    message: 'Token refreshed',
    data: { user: buildAuthPayload(employee), ...tokens },
  });
});

/**
 * POST /api/auth/logout
 * Ends the session tied to the presented refresh token.
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await UserSession.findOneAndUpdate(
      { token: hashToken(refreshToken), logout_at: null },
      { logout_at: new Date() }
    );
  }
  return sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me — current authenticated user.
 */
const me = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user.id)
    .populate('role_id', 'name')
    .populate('department_id', 'name');
  if (!employee) throw ApiError.notFound('Account not found');
  return sendSuccess(res, { data: buildAuthPayload(employee) });
});

/**
 * POST /api/auth/forgot-password
 * Hackathon-friendly mock: generates a reset token and returns it in the
 * response instead of emailing it. Swap the response for an email send in prod.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const employee = await Employee.findOne({ email });

  // Always respond the same way to avoid leaking which emails exist.
  const generic = { message: 'If the account exists, a reset token has been generated' };
  if (!employee) return sendSuccess(res, generic);

  const resetToken = crypto.randomBytes(24).toString('hex');
  // In a real system: persist a hash + expiry and email a reset link.
  return sendSuccess(res, {
    ...generic,
    data: { resetToken, note: 'Mocked for demo — deliver via email in production' },
  });
});

module.exports = { signup, login, refresh, logout, me, forgotPassword };
