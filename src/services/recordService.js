import Record from '../models/Record.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import { buildPagination } from '../utils/response.js';
import logger from '../utils/logger.js';

class RecordService {
  _buildFilterQuery({ type, category, startDate, endDate, search }) {
    const query = {};

    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (search) query.notes = { $regex: search, $options: 'i' };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    return query;
  }

  async createRecord(data, userId) {
    const record = await Record.create({ ...data, createdBy: userId });
    logger.info(`Record created: ${record._id} by user ${userId}`);
    return record.populate('createdBy', 'name email');
  }

  async getRecords({ page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc', userId, role, ...filters } = {}) {
    const query = this._buildFilterQuery(filters);

    // Viewers and analysts see only their own records
    if (role !== 'admin') query.createdBy = userId;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Record.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Record.countDocuments(query),
    ]);

    return { records, pagination: buildPagination(page, limit, total) };
  }

  async getRecordById(id, userId, role) {
    const record = await Record.findById(id).populate('createdBy', 'name email');
    if (!record) throw new NotFoundError('Record');

    if (role !== 'admin' && record.createdBy._id.toString() !== userId) {
      throw new AuthorizationError('You do not have access to this record');
    }

    return record;
  }

  async updateRecord(id, updates, userId, role) {
    const record = await Record.findById(id);
    if (!record) throw new NotFoundError('Record');

    if (role !== 'admin' && record.createdBy.toString() !== userId) {
      throw new AuthorizationError('You can only update your own records');
    }

    const updated = await Record.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    logger.info(`Record updated: ${id} by user ${userId}`);
    return updated;
  }

  async deleteRecord(id, userId, role) {
    const record = await Record.findById(id);
    if (!record) throw new NotFoundError('Record');

    if (role !== 'admin' && record.createdBy.toString() !== userId) {
      throw new AuthorizationError('You can only delete your own records');
    }

    await record.softDelete(userId);
    logger.info(`Record soft-deleted: ${id} by user ${userId}`);
  }
}

export default new RecordService();
