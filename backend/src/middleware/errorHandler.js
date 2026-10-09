import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, process.env.NODE_ENV === 'development' ? err.stack : null, statusCode);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, `Route ${req.originalUrl} not found`, null, 404);
};
