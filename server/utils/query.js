/**
 * Parses pagination params from a request query, applying sane bounds.
 * Returns { page, limit, skip } ready to feed into a Mongoose query.
 */
const getPagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

module.exports = { getPagination };
