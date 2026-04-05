import Joi from 'joi';

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().lowercase(),
  status: Joi.string().valid('active', 'inactive'),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

export const assignRoleSchema = Joi.object({
  role: Joi.string().valid('viewer', 'analyst', 'admin').required(),
});

export const setStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required(),
});

export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid('viewer', 'analyst', 'admin'),
  status: Joi.string().valid('active', 'inactive'),
  search: Joi.string().trim().max(100),
});

export const mongoIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid ID format' }),
});
