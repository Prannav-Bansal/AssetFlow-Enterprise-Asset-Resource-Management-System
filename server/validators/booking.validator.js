const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createBookingSchema = Joi.object({
  asset_id: objectId.required(),
  start_datetime: Joi.date().iso().required(),
  end_datetime: Joi.date().iso().greater(Joi.ref('start_datetime')).required(),
  purpose: Joi.string().allow('', null),
}).messages({
  'date.greater': 'end_datetime must be after start_datetime',
});

const rescheduleSchema = Joi.object({
  start_datetime: Joi.date().iso().required(),
  end_datetime: Joi.date().iso().greater(Joi.ref('start_datetime')).required(),
});

module.exports = { createBookingSchema, rescheduleSchema };
