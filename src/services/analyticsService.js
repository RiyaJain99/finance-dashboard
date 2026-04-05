import Record from '../models/Record.js';

class AnalyticsService {
  _baseMatch(userId, role, startDate, endDate) {
    const match = { isDeleted: { $ne: true } };
    if (role !== 'admin') match.createdBy = userId;
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    return match;
  }

  async getSummary(userId, role, { startDate, endDate } = {}) {
    const match = this._baseMatch(userId, role, startDate, endDate);

    const [result] = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          totalRecords: { $sum: 1 },
          incomeCount: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, 1, 0] },
          },
          expenseCount: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          netBalance: { $subtract: ['$totalIncome', '$totalExpenses'] },
        },
      },
      { $project: { _id: 0 } },
    ]);

    return result || {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      totalRecords: 0,
      incomeCount: 0,
      expenseCount: 0,
    };
  }

  async getCategoryBreakdown(userId, role, { startDate, endDate, type } = {}) {
    const match = this._baseMatch(userId, role, startDate, endDate);
    if (type) match.type = type;

    return Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          type: '$_id.type',
          total: { $round: ['$total', 2] },
          count: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  async getMonthlyTrends(userId, role, { year } = {}) {
    const match = this._baseMatch(userId, role);
    const targetYear = parseInt(year) || new Date().getFullYear();

    match.date = {
      $gte: new Date(`${targetYear}-01-01`),
      $lte: new Date(`${targetYear}-12-31`),
    };

    const raw = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Normalize into a full 12-month array
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(targetYear, i, 1).toLocaleString('default', { month: 'short' }),
      income: 0,
      expenses: 0,
      net: 0,
    }));

    raw.forEach(({ _id, total }) => {
      const monthData = months[_id.month - 1];
      if (_id.type === 'income') monthData.income = parseFloat(total.toFixed(2));
      if (_id.type === 'expense') monthData.expenses = parseFloat(total.toFixed(2));
    });

    months.forEach((m) => {
      m.net = parseFloat((m.income - m.expenses).toFixed(2));
    });

    return { year: targetYear, months };
  }

  async getRecentTransactions(userId, role, limit = 5) {
    const match = this._baseMatch(userId, role);

    return Record.aggregate([
      { $match: match },
      { $sort: { date: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
          pipeline: [{ $project: { name: 1, email: 1 } }],
        },
      },
      { $unwind: '$creator' },
      {
        $project: {
          amount: 1,
          type: 1,
          category: 1,
          date: 1,
          notes: 1,
          creator: 1,
          createdAt: 1,
        },
      },
    ]);
  }

  async getTopCategories(userId, role, { type, limit = 5 } = {}) {
    const match = this._baseMatch(userId, role);
    if (type) match.type = type;

    return Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);
  }
}

export default new AnalyticsService();
