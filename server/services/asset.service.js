const ApiError = require('../utils/ApiError');
const { ASSET_STATUS_TRANSITIONS } = require('../config/constants');

/**
 * Validates an asset lifecycle transition against the allowed transition map.
 * Throws a 400 if the move is illegal. Transitioning to the same status is a
 * no-op and always allowed.
 */
const assertValidStatusTransition = (from, to) => {
  if (from === to) return;
  const allowed = ASSET_STATUS_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw ApiError.badRequest(
      `Invalid status change: ${from} → ${to}. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }
};

module.exports = { assertValidStatusTransition };
