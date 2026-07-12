const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/responseHelper');

/** 404 handler for unmatched routes. */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central error handler. Normalizes ApiError, Mongoose, JWT, and Multer errors
 * into the standard { success:false, message, details? } envelope.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Known operational error
  if (err instanceof ApiError) {
    return sendError(res, { statusCode: err.statusCode, message: err.message, details: err.details });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return sendError(res, { statusCode: 400, message: `Invalid ${err.path}: ${err.value}` });
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, { statusCode: 400, message: 'Validation failed', details });
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return sendError(res, {
      statusCode: 409,
      message: `Duplicate value for '${field}'`,
      details: err.keyValue,
    });
  }

  // Multer upload errors
  if (err instanceof multer.MulterError) {
    return sendError(res, { statusCode: 400, message: `Upload error: ${err.message}` });
  }

  // Unexpected: log full error, return generic message
  console.error('✗ Unhandled error:', err);
  return sendError(res, {
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

module.exports = { notFound, errorHandler };
