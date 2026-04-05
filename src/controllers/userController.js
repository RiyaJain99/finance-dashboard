import userService from '../services/userService.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const getUsers = catchAsync(async (req, res) => {
  const { page, limit, role, status, search } = req.query;
  const { users, pagination } = await userService.getUsers({ page, limit, role, status, search });
  sendPaginated(res, users, pagination, 'Users retrieved successfully');
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, { user });
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, { user }, 'User updated successfully');
});

export const assignRole = catchAsync(async (req, res) => {
  const user = await userService.assignRole(req.params.id, req.body.role);
  sendSuccess(res, { user }, 'Role assigned successfully');
});

export const setUserStatus = catchAsync(async (req, res) => {
  const user = await userService.setStatus(req.params.id, req.body.status);
  sendSuccess(res, { user }, `User ${req.body.status} successfully`);
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, null, 'User deleted successfully');
});
