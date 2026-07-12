const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES || '7d';

/**
 * Signs a short-lived access token. Payload carries the identity the auth
 * middleware attaches to req.user.
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

/**
 * Signs a long-lived refresh token. Only the employee id is embedded.
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

/**
 * One-way hash of a token, stored in UserSession so raw refresh tokens are
 * never persisted (defence in depth if the DB leaks).
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
