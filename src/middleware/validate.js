import { ValidationError } from '../utils/errors.js';

const PARTS = ['body', 'query', 'params'];

/**
 * Validates req[part] against a Joi schema.
 * Usage: validate(schema) or validate(schema, 'query')
 */
export const validate = (schema, part = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      throw new ValidationError('Validation failed', errors);
    }

    req[part] = value;
    next();
  };
};

/**
 * Validates multiple parts simultaneously.
 * Usage: validateMultiple({ body: bodySchema, query: querySchema })
 */
export const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    for (const part of PARTS) {
      if (!schemas[part]) continue;

      const { error, value } = schemas[part].validate(req[part], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errors = error.details.map((d) => ({
          field: `${part}.${d.path.join('.')}`,
          message: d.message.replace(/['"]/g, ''),
        }));
        allErrors.push(...errors);
      } else {
        req[part] = value;
      }
    }

    if (allErrors.length) throw new ValidationError('Validation failed', allErrors);
    next();
  };
};
