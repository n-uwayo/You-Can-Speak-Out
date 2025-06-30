// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ValidationError } from 'express-validator';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: any;
  stack?: string;
}

// Handle Prisma errors
const handlePrismaError = (error: any): AppError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        return new AppError(`${field} already exists`, 409);
      
      case 'P2025':
        // Record not found
        return new AppError('Record not found', 404);
      
      case 'P2003':
        // Foreign key constraint violation
        return new AppError('Related record not found', 400);
      
      case 'P2014':
        // Required relation missing
        return new AppError('Required relation is missing', 400);
      
      case 'P2021':
        // Table does not exist
        return new AppError('Database table does not exist', 500);
      
      case 'P2022':
        // Column does not exist
        return new AppError('Database column does not exist', 500);
      
      default:
        return new AppError('Database operation failed', 500);
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return new AppError('Unknown database error occurred', 500);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new AppError('Database engine error', 500);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database connection failed', 500);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError('Invalid database query', 400);
  }

  return new AppError('Database error occurred', 500);
};

// Handle JWT errors
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401);
  }
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401);
  }
  if (error.name === 'NotBeforeError') {
    return new AppError('Token not active yet', 401);
  }
  return new AppError('Authentication failed', 401);
};

// Handle validation errors
const handleValidationError = (errors: ValidationError[]): AppError => {
  const errorMessages = errors.map(error => error.msg);
  return new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
};

// Handle cast errors (MongoDB ObjectId, etc.)
const handleCastError = (error: any): AppError => {
  return new AppError('Invalid ID format', 400);
};

// Handle duplicate key errors
const handleDuplicateKeyError = (error: any): AppError => {
  const field = Object.keys(error.keyValue)[0];
  return new AppError(`${field} already exists`, 409);
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message,
    error: err.name,
    stack: err.stack,
    details: err
  };

  res.status(err.statusCode).json(errorResponse);
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: err.message
    };
    res.status(err.statusCode).json(errorResponse);
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥:', err);
    
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Something went wrong!'
    };
    res.status(500).json(errorResponse);
  }
};

// Main error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Set default values
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  if (!error.isOperational) {
    error.isOperational = false;
  }

  // Log error for monitoring
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name?.includes('Prisma') || error instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
    error = handleJWTError(error);
  } else if (error.name === 'ValidationError' && error.errors) {
    error = handleValidationError(error.errors);
  } else if (error.name === 'CastError') {
    error = handleCastError(error);
  } else if (error.code === 11000) {
    error = handleDuplicateKeyError(error);
  } else if (error.name === 'MulterError') {
    // Handle file upload errors
    error = new AppError('File upload error: ' + error.message, 400);
  } else if (error.type === 'entity.parse.failed') {
    // Handle JSON parse errors
    error = new AppError('Invalid JSON format', 400);
  } else if (error.type === 'entity.too.large') {
    // Handle payload too large errors
    error = new AppError('Request payload too large', 413);
  }

  // Convert to AppError if not already
  if (!(error instanceof AppError)) {
    error = new AppError(error.message || 'Something went wrong', error.statusCode || 500);
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (err: Error) => {
    console.error('UNHANDLED PROMISE REJECTION! 💥');
    console.error('Error:', err.name, err.message);
    console.error('Stack:', err.stack);
    // Don't exit immediately in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

// Handle uncaught exceptions
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥');
    console.error('Error:', err.name, err.message);
    console.error('Stack:', err.stack);
    // Don't exit immediately in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

// 404 Not Found handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Rate limiting error handler
export const handleRateLimitError = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: 'Too many requests, please try again later'
  };
  res.status(429).json(errorResponse);
};