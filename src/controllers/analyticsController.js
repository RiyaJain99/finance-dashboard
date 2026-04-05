import analyticsService from '../services/analyticsService.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../middleware/errorHandler.js';

const getContext = (req) => ({ userId: req.user.id, role: req.user.role });

export const getSummary = catchAsync(async (req, res) => {
  const { userId, role } = getContext(req);
  const { startDate, endDate } = req.query;
  const summary = await analyticsService.getSummary(userId, role, { startDate, endDate });
  sendSuccess(res, { summary });
});

export const getCategoryBreakdown = catchAsync(async (req, res) => {
  const { userId, role } = getContext(req);
  const { startDate, endDate, type } = req.query;
  const breakdown = await analyticsService.getCategoryBreakdown(userId, role, {
    startDate,
    endDate,
    type,
  });
  sendSuccess(res, { breakdown });
});

export const getMonthlyTrends = catchAsync(async (req, res) => {
  const { userId, role } = getContext(req);
  const { year } = req.query;
  const trends = await analyticsService.getMonthlyTrends(userId, role, { year });
  sendSuccess(res, { trends });
});

export const getRecentTransactions = catchAsync(async (req, res) => {
  const { userId, role } = getContext(req);
  const { limit } = req.query;
  const transactions = await analyticsService.getRecentTransactions(userId, role, limit);
  sendSuccess(res, { transactions });
});

export const getTopCategories = catchAsync(async (req, res) => {
  const { userId, role } = getContext(req);
  const { type, limit } = req.query;
  const categories = await analyticsService.getTopCategories(userId, role, { type, limit });
  sendSuccess(res, { categories });
});
