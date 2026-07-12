const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().allow('', null),
  custom_fields: Joi.object().unknown(true).default({}),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().allow('', null),
  custom_fields: Joi.object().unknown(true),
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };
