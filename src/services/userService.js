import User from '../models/User.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { buildPagination } from '../utils/response.js';
import logger from '../utils/logger.js';

class UserService {
  async getUsers({ page = 1, limit = 20, role, status, search } = {}) {
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return { users, pagination: buildPagination(page, limit, total) };
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async updateUser(id, updates) {
    // Prevent role escalation by non-admins - enforced at controller level
    const restrictedFields = ['password', 'passwordChangedAt'];
    restrictedFields.forEach((field) => delete updates[field]);

    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: id } });
      if (existing) throw new ConflictError('Email already in use');
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) throw new NotFoundError('User');
    logger.info(`User updated: ${user.email}`);
    return user;
  }

  async assignRole(userId, role) {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) throw new NotFoundError('User');
    logger.info(`Role '${role}' assigned to user: ${user.email}`);
    return user;
  }

  async setStatus(userId, status) {
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );
    if (!user) throw new NotFoundError('User');
    logger.info(`User ${user.email} status changed to: ${status}`);
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError('User');
    logger.info(`User deleted: ${user.email}`);
  }
}

export default new UserService();
