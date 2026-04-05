import { Router } from 'express';
import * as recordController from '../controllers/recordController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createRecordSchema,
  updateRecordSchema,
  getRecordsQuerySchema,
  mongoIdSchema,
} from '../validators/recordValidators.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial record management
 */

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Get financial records with filters and pagination
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [date, amount, createdAt], default: date }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200: { description: Paginated list of records }
 *   post:
 *     summary: Create a new financial record
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount: { type: number, example: 1500.00 }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string, example: Salary }
 *               date: { type: string, format: date }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Record created }
 */
router
  .route('/')
  .get(validate(getRecordsQuerySchema, 'query'), recordController.getRecords)
  .post(authorize('analyst'), validate(createRecordSchema), recordController.createRecord);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get a single record by ID
 *     tags: [Records]
 *   put:
 *     summary: Update a financial record
 *     tags: [Records]
 *   delete:
 *     summary: Soft delete a financial record
 *     tags: [Records]
 */
router
  .route('/:id')
  .get(validate(mongoIdSchema, 'params'), recordController.getRecordById)
  .put(
    authorize('analyst'),
    validate(mongoIdSchema, 'params'),
    validate(updateRecordSchema),
    recordController.updateRecord
  )
  .delete(
    authorize('analyst'),
    validate(mongoIdSchema, 'params'),
    recordController.deleteRecord
  );

export default router;
