const Joi = require('joi');
const { AUDIT_RESULT_VALUES } = require('../config/constants');

const objectId = Joi.string().hex().length(24);

const createCycleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  scope_department_id: objectId.allow(null),
  scope_location: Joi.string().allow('', null),
  start_date: Joi.date().iso().allow(null),
  end_date: Joi.date().iso().allow(null),
  auditors: Joi.array().items(objectId).default([]),
});

const assignAuditorsSchema = Joi.object({
  auditors: Joi.array().items(objectId).min(1).required(),
});

const recordResultSchema = Joi.object({
  result: Joi.string()
    .valid(...AUDIT_RESULT_VALUES)
    .required(),
  remarks: Joi.string().allow('', null),
});

module.exports = { createCycleSchema, assignAuditorsSchema, recordResultSchema };
