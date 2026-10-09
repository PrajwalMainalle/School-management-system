/**
 * Standardized Success Response Helper
 */
export const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standardized Error Response Helper
 */
export const sendError = (res, message = 'Internal Server Error', errorDetails = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errorDetails,
    timestamp: new Date().toISOString(),
  });
};
