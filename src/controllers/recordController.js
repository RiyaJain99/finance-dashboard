import recordService from '../services/recordService.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const createRecord = catchAsync(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user.id);
  sendCreated(res, { record }, 'Record created successfully');
});

export const getRecords = catchAsync(async (req, res) => {
  const { page, limit, type, category, startDate, endDate, search, sortBy, sortOrder } = req.query;
  const { records, pagination } = await recordService.getRecords({
    page,
    limit,
    type,
    category,
    startDate,
    endDate,
    search,
    sortBy,
    sortOrder,
    userId: req.user.id,
    role: req.user.role,
  });
  sendPaginated(res, records, pagination, 'Records retrieved successfully');
});

export const getRecordById = catchAsync(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, { record });
});

export const updateRecord = catchAsync(async (req, res) => {
  const record = await recordService.updateRecord(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );
  sendSuccess(res, { record }, 'Record updated successfully');
});

export const deleteRecord = catchAsync(async (req, res) => {
  await recordService.deleteRecord(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, null, 'Record deleted successfully');
});
