const Joi = require('joi');
const { MAINTENANCE_PRIORITY_VALUES } = require('../config/constants');

const objectId = Joi.string().hex().length(24);

const createMaintenanceSchema = Joi.object({
  asset_id: objectId.required(),
  issue_description: Joi.string().trim().min(3).required(),
  priority: Joi.string().valid(...MAINTENANCE_PRIORITY_VALUES),
});

const rejectSchema = Joi.object({
  resolution_notes: Joi.string().allow('', null),
});

const assignSchema = Joi.object({
  technician_id: objectId.required(),
});

const resolveSchema = Joi.object({
  resolution_notes: Joi.string().allow('', null),
});

module.exports = { createMaintenanceSchema, rejectSchema, assignSchema, resolveSchema };
