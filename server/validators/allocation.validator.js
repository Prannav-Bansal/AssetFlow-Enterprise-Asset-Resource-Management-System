const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createAllocationSchema = Joi.object({
  asset_id: objectId.required(),
  employee_id: objectId.required(),
  department_id: objectId.allow(null),
  expected_return_date: Joi.date().iso().allow(null),
})
  // Either an employee or a department must receive the asset; employee is
  // required here as the primary holder, department is optional context.
  .required();

const returnAllocationSchema = Joi.object({
  condition_on_return: Joi.string().allow('', null),
  return_notes: Joi.string().allow('', null),
});

const createTransferSchema = Joi.object({
  allocation_id: objectId.required(),
  to_employee_id: objectId.required(),
  remarks: Joi.string().allow('', null),
});

const rejectTransferSchema = Joi.object({
  remarks: Joi.string().allow('', null),
});

module.exports = {
  createAllocationSchema,
  returnAllocationSchema,
  createTransferSchema,
  rejectTransferSchema,
};
