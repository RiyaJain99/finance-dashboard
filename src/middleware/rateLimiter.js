import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
      },
    },
    skip: () => process.env.NODE_ENV === 'test',
  });

// Strict limit for auth endpoints to prevent brute-force
export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  20,
  'Too many attempts. Please try again in 15 minutes.'
);

// General API rate limiter
export const apiLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  'Too many requests. Please slow down.'
);
