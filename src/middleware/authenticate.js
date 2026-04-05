import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthenticationError } from '../utils/errors.js';
import { catchAsync } from './errorHandler.js';

export const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization header missing or malformed');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.sub);
  if (!user) throw new AuthenticationError('User no longer exists');
  if (!user.isActive()) throw new AuthenticationError('Account is deactivated');

  // Invalidate tokens issued before password change
  if (user.passwordChangedAt) {
    const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedAt) {
      throw new AuthenticationError('Password recently changed. Please log in again.');
    }
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  next();
});
