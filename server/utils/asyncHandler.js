/**
 * Wraps an async route handler so any thrown/rejected error is forwarded to
 * Express's error middleware. This removes the need for try/catch in every
 * controller.
 *
 *   router.get('/', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
