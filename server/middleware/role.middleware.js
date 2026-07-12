const ApiError = require('../utils/ApiError');

/**
 * Route guard factory. Use after `authenticate`:
 *
 *   router.post('/', authenticate, authorize('Admin', 'Asset Manager'), handler)
 *
 * Passing no roles allows any authenticated user.
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
    return next(
      ApiError.forbidden(`Requires one of the following roles: ${allowedRoles.join(', ')}`)
    );
  }
  next();
};

module.exports = { authorize };
