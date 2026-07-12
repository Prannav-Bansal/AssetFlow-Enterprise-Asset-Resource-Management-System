/**
 * Standardized API response envelope so every endpoint returns the same shape:
 *   { success, message, data, meta? }
 * The frontend can therefore handle all responses uniformly.
 */

const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendError = (res, { statusCode = 500, message = 'Something went wrong', details } = {}) => {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};

/**
 * Builds a pagination meta object from total count and query params.
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});

module.exports = { sendSuccess, sendError, buildPaginationMeta };
