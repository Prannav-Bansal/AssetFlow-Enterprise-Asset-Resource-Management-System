const Joi = require('joi');
const { ACTIVE_STATUS_VALUES } = require('../config/constants');

const objectId = Joi.string().hex().length(24);

const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  parent_department_id: objectId.allow(null),
  head_employee_id: objectId.allow(null),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  parent_department_id: objectId.allow(null),
  head_employee_id: objectId.allow(null),
}).min(1);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...ACTIVE_STATUS_VALUES)
    .required(),
});

module.exports = { createDepartmentSchema, updateDepartmentSchema, statusSchema };
