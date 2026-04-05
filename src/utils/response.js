export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

export const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const buildPagination = (page, limit, total) => ({
  page: parseInt(page),
  limit: parseInt(limit),
  total,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
