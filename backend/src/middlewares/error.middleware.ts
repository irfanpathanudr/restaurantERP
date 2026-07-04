import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.error('Application error', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    logger.error('Validation error', {
      message: err.message,
      stack: err.stack,
    });

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.message,
    });
  }

  // Handle database errors
  if (err.name === 'QueryFailedError') {
    logger.error('Database error', {
      message: err.message,
      stack: err.stack,
    });

    return res.status(500).json({
      success: false,
      message: 'Database error occurred',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.error('JWT error', {
      message: err.message,
      stack: err.stack,
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.url,
    method: req.method,
  });

  // Don't expose internal errors in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  return res.status(500).json({
    success: false,
    message,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
  });

  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
