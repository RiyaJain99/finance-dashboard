import authService from '../services/authService.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  sendCreated(res, result, 'Registration successful');
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendSuccess(res, result, 'Login successful');
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);
  sendSuccess(res, tokens, 'Tokens refreshed');
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  sendSuccess(res, null, 'Password changed successfully');
});

export const getMe = catchAsync(async (req, res) => {
  sendSuccess(res, { user: req.user });
});
