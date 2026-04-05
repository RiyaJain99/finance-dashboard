import Joi from 'joi';

export const createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().min(1).max(50).required(),
  date: Joi.date().iso().max('now').default(Date.now),
  notes: Joi.string().trim().max(500).allow('', null),
});

export const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().min(1).max(50),
  date: Joi.date().iso().max('now'),
  notes: Joi.string().trim().max(500).allow('', null),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

export const getRecordsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().max(50),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.min': 'endDate must be after startDate',
  }),
  search: Joi.string().trim().max(100),
  sortBy: Joi.string().valid('date', 'amount', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  type: Joi.string().valid('income', 'expense'),
  year: Joi.number().integer().min(2000).max(new Date().getFullYear()),
  limit: Joi.number().integer().min(1).max(20).default(5),
});

export const mongoIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid ID format' }),
});
