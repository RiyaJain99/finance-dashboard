import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  buildTokenPayload,
} from '../utils/jwt.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

class AuthService {
  async register(userData) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) throw new ConflictError('Email already registered');

    const user = await User.create(userData);
    logger.info(`New user registered: ${user.email} [${user.role}]`);

    const payload = buildTokenPayload(user);
    return {
      user,
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive()) {
      throw new AuthenticationError('Account is deactivated. Contact support.');
    }

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    logger.info(`User logged in: ${user.email}`);

    const payload = buildTokenPayload(user);
    return {
      user,
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  async refreshTokens(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive()) {
      throw new AuthenticationError('User not found or inactive');
    }

    const payload = buildTokenPayload(user);
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new AuthenticationError('Current password is incorrect');

    user.password = newPassword;
    await user.save();
    logger.info(`Password changed for user: ${user.email}`);
  }
}

export default new AuthService();
