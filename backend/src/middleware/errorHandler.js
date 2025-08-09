import { logger, securityLogger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Log security-related errors
  if (err.name === 'UnauthorizedError' || err.status === 401 || err.status === 403) {
    securityLogger.warn('Security violation detected:', {
      error: err.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle different types of errors
  let status = 500;
  let message = 'Internal server error';

  if (err.status) {
    status = err.status;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized access';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  } else if (err.code === '23505') { // PostgreSQL unique violation
    status = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    status = 400;
    message = 'Invalid reference';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(status).json({
      success: false,
      message: status === 500 ? 'Internal server error' : message,
      ...(status !== 500 && { code: err.code }),
    });
  } else {
    res.status(status).json({
      success: false,
      message,
      stack: err.stack,
      code: err.code,
    });
  }
};