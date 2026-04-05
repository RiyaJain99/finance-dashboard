import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  updateUserSchema,
  assignRoleSchema,
  setStatusSchema,
  getUsersQuerySchema,
  mongoIdSchema,
} from '../validators/userValidators.js';

const router = Router();

// All user management routes require authentication and admin role
router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [viewer, analyst, admin] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of users }
 */
router.get('/', validate(getUsersQuerySchema, 'query'), userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *   delete:
 *     summary: Permanently delete a user
 *     tags: [Users]
 */
router
  .route('/:id')
  .get(validate(mongoIdSchema, 'params'), userController.getUserById)
  .put(
    validate(mongoIdSchema, 'params'),
    validate(updateUserSchema),
    userController.updateUser
  )
  .delete(validate(mongoIdSchema, 'params'), userController.deleteUser);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Assign a role to a user
 *     tags: [Users]
 */
router.patch(
  '/:id/role',
  validate(mongoIdSchema, 'params'),
  validate(assignRoleSchema),
  userController.assignRole
);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user account
 *     tags: [Users]
 */
router.patch(
  '/:id/status',
  validate(mongoIdSchema, 'params'),
  validate(setStatusSchema),
  userController.setUserStatus
);

export default router;
