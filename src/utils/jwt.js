import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errors.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'finance-dashboard',
    audience: 'finance-dashboard-client',
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'finance-dashboard',
      audience: 'finance-dashboard-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired');
    }
    throw new AuthenticationError('Invalid token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AuthenticationError('Invalid refresh token');
  }
};

export const buildTokenPayload = (user) => ({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
});
