import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { analyticsQuerySchema } from '../validators/recordValidators.js';

const router = Router();

router.use(authenticate, authorize('analyst'));

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard analytics and aggregations (Analyst + Admin)
 */

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get total income, expenses, and net balance
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 summary:
 *                   totalIncome: 15000
 *                   totalExpenses: 9200
 *                   netBalance: 5800
 *                   totalRecords: 42
 */
router.get('/summary', validate(analyticsQuerySchema, 'query'), analyticsController.getSummary);

/**
 * @swagger
 * /analytics/categories:
 *   get:
 *     summary: Get spending/income grouped by category
 *     tags: [Analytics]
 */
router.get(
  '/categories',
  validate(analyticsQuerySchema, 'query'),
  analyticsController.getCategoryBreakdown
);

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get monthly income vs expense trends for a given year
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2024 }
 */
router.get(
  '/trends',
  validate(analyticsQuerySchema, 'query'),
  analyticsController.getMonthlyTrends
);

/**
 * @swagger
 * /analytics/recent:
 *   get:
 *     summary: Get the most recent transactions
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5, maximum: 20 }
 */
router.get(
  '/recent',
  validate(analyticsQuerySchema, 'query'),
  analyticsController.getRecentTransactions
);

/**
 * @swagger
 * /analytics/top-categories:
 *   get:
 *     summary: Get top spending/income categories by total amount
 *     tags: [Analytics]
 */
router.get(
  '/top-categories',
  validate(analyticsQuerySchema, 'query'),
  analyticsController.getTopCategories
);

export default router;
