import { AppError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const handleMongooseCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400, 'INVALID_ID');

const handleMongooseDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 409, 'DUPLICATE_KEY');
};

const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new ValidationError('Validation failed', errors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('Token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      errors: err.errors,
      stack: err.stack,
    },
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    const body = {
      success: false,
      error: {
        code: err.code || 'ERROR',
        message: err.message,
      },
    };
    if (err.errors) body.error.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }

  // Programmer errors - don't leak details
  logger.error('UNHANDLED ERROR:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
    },
  });
};

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') error = handleMongooseCastError(err);
  else if (err.code === 11000) error = handleMongooseDuplicateKey(err);
  else if (err.name === 'ValidationError') error = handleMongooseValidationError(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (!error.isOperational) {
    logger.error(`[${req.method}] ${req.path} - ${err.message}`, { stack: err.stack });
  }

  process.env.NODE_ENV === 'development' ? sendErrorDev(error, res) : sendErrorProd(error, res);
};

// Wraps async route handlers to forward errors to express error middleware
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
};
