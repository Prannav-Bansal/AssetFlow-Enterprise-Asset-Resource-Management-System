const Joi = require('joi');
const { ROLE_VALUES, ACTIVE_STATUS_VALUES } = require('../config/constants');

const objectId = Joi.string().hex().length(24);

const updateEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  department_id: objectId.allow(null),
}).min(1);

const roleSchema = Joi.object({
  role: Joi.string()
    .valid(...ROLE_VALUES)
    .required(),
});

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...ACTIVE_STATUS_VALUES)
    .required(),
});

module.exports = { updateEmployeeSchema, roleSchema, statusSchema };
