const Joi = require('joi');
const {
  ASSET_STATUS_VALUES,
  ASSET_CONDITION_VALUES,
} = require('../config/constants');

const objectId = Joi.string().hex().length(24);

// Multipart form fields arrive as strings, so booleans/numbers are coerced.
const createAssetSchema = Joi.object({
  category_id: objectId.required(),
  name: Joi.string().trim().min(2).max(150).required(),
  serial_number: Joi.string().trim().allow('', null),
  description: Joi.string().allow('', null),
  is_bookable: Joi.boolean().default(false),
  condition: Joi.string().valid(...ASSET_CONDITION_VALUES),
  location: Joi.string().allow('', null),
  acquisition_date: Joi.date().iso().allow('', null),
  acquisition_cost: Joi.number().min(0).allow('', null),
});

const updateAssetSchema = Joi.object({
  category_id: objectId,
  name: Joi.string().trim().min(2).max(150),
  serial_number: Joi.string().trim().allow('', null),
  description: Joi.string().allow('', null),
  is_bookable: Joi.boolean(),
  condition: Joi.string().valid(...ASSET_CONDITION_VALUES),
  location: Joi.string().allow('', null),
  acquisition_date: Joi.date().iso().allow('', null),
  acquisition_cost: Joi.number().min(0).allow('', null),
}).min(1);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...ASSET_STATUS_VALUES)
    .required(),
  note: Joi.string().allow('', null),
});

module.exports = { createAssetSchema, updateAssetSchema, statusSchema };
