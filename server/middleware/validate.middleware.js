const ApiError = require('../utils/ApiError');

/**
 * Runs a Joi schema against a chosen request property ('body' | 'query' |
 * 'params') and replaces it with the validated/coerced value. Collects all
 * errors (abortEarly: false) and strips unknown keys.
 *
 *   router.post('/', validate(createAssetSchema), handler)
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, ''),
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }

  req[property] = value;
  next();
};

module.exports = { validate };
