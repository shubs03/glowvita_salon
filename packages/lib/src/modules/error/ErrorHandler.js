/**
 * Error Handler Module
 * Comprehensive error handling and logging for the booking system
 */

// Error categories
const ERROR_CATEGORIES = {
  VALIDATION: 'VALIDATION_ERROR',
  DATABASE: 'DATABASE_ERROR',
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  BUSINESS_LOGIC: 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
  SYSTEM: 'SYSTEM_ERROR'
};

// Error codes
const ERROR_CODES = {
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Database errors
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Business logic errors
  SLOT_CONFLICT: 'SLOT_CONFLICT',
  OUTSIDE_WORKING_HOURS: 'OUTSIDE_WORKING_HOURS',
  TRAVEL_RADIUS_EXCEEDED: 'TRAVEL_RADIUS_EXCEEDED',
  BOOKING_IN_PAST: 'BOOKING_IN_PAST',
  
  // External service errors
  GOOGLE_MAPS_API_ERROR: 'GOOGLE_MAPS_API_ERROR',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, code, category, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Validation Error Class
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(
      message,
      ERROR_CODES.INVALID_INPUT,
      ERROR_CATEGORIES.VALIDATION,
      400,
      details
    );
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error Class
 */
class AuthenticationError extends AppError {
  constructor(message, code = ERROR_CODES.INVALID_CREDENTIALS) {
    super(
      message,
      code,
      ERROR_CATEGORIES.AUTHENTICATION,
      401
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error Class
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(
      message,
      ERROR_CODES.ACCESS_DENIED,
      ERROR_CATEGORIES.AUTHORIZATION,
      403
    );
    this.name = 'AuthorizationError';
  }
}

/**
 * Business Logic Error Class
 */
class BusinessLogicError extends AppError {
  constructor(message, code = ERROR_CODES.BUSINESS_LOGIC_ERROR, details = null) {
    super(
      message,
      code,
      ERROR_CATEGORIES.BUSINESS_LOGIC,
      400,
      details
    );
    this.name = 'BusinessLogicError';
  }
}

/**
 * External Service Error Class
 */
class ExternalServiceError extends AppError {
  constructor(message, code = ERROR_CODES.EXTERNAL_SERVICE_ERROR, details = null) {
    super(
      message,
      code,
      ERROR_CATEGORIES.EXTERNAL_SERVICE,
      503,
      details
    );
    this.name = 'ExternalServiceError';
  }
}

/**
 * Handle and format errors for API responses
 * @param {Error} error - Error object
 * @param {boolean} isDevelopment - Whether in development mode
 * @returns {Object} - Formatted error response
 */
export function formatErrorResponse(error, isDevelopment = false) {
  // Handle known application errors
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        category: error.category,
        message: error.message,
        ...(isDevelopment && { stack: error.stack }),
        ...(error.details && { details: error.details }),
        timestamp: error.timestamp
      },
      statusCode: error.statusCode
    };
  }
  
  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if (error.code === 11000) {
      // Duplicate key error
      return {
        success: false,
        error: {
          code: ERROR_CODES.DUPLICATE_RECORD,
          category: ERROR_CATEGORIES.DATABASE,
          message: 'Duplicate record found',
          ...(isDevelopment && { stack: error.stack }),
          timestamp: new Date().toISOString()
        },
        statusCode: 409
      };
    }
    
    // Other MongoDB errors
    return {
      success: false,
      error: {
        code: ERROR_CODES.DATABASE_CONNECTION_FAILED,
        category: ERROR_CATEGORIES.DATABASE,
        message: 'Database error occurred',
        ...(isDevelopment && { stack: error.stack, mongoError: error.message }),
        timestamp: new Date().toISOString()
      },
      statusCode: 500
    };
  }
  
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const details = Object.keys(error.errors).map(key => ({
      field: key,
      message: error.errors[key].message
    }));
    
    return {
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        category: ERROR_CATEGORIES.VALIDATION,
        message: 'Validation failed',
        details,
        ...(isDevelopment && { stack: error.stack }),
        timestamp: new Date().toISOString()
      },
      statusCode: 400
    };
  }
  
  // Handle CastError (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return {
      success: false,
      error: {
        code: ERROR_CODES.INVALID_FORMAT,
        category: ERROR_CATEGORIES.VALIDATION,
        message: `Invalid ${error.kind} format for field ${error.path}`,
        ...(isDevelopment && { stack: error.stack }),
        timestamp: new Date().toISOString()
      },
      statusCode: 400
    };
  }
  
  // Handle generic errors
  return {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      category: ERROR_CATEGORIES.SYSTEM,
      message: isDevelopment ? error.message : 'An unexpected error occurred',
      ...(isDevelopment && { stack: error.stack }),
      timestamp: new Date().toISOString()
    },
    statusCode: 500
  };
}

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {Object} context - Context information
 * @param {string} level - Log level (error, warn, info)
 */
export function logError(error, context = {}, level = 'error') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: error.message,
    error: {
      name: error.name,
      code: error.code,
      category: error.category,
      stack: error.stack
    },
    context
  };
  
  // In production, you might send this to a logging service
  console[level]('ERROR LOG:', JSON.stringify(logEntry, null, 2));
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {string} category - Error category
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {AppError} - AppError instance
 */
export function createError(message, code, category, statusCode = 500, details = null) {
  return new AppError(message, code, category, statusCode, details);
}

/**
 * Wrap async functions with error handling
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function globalErrorHandler(error, req, res, next) {
  // Log the error
  logError(error, {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  // Format the error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = formatErrorResponse(error, isDevelopment);
  
  // Send the response
  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.error.message,
    ...errorResponse
  });
}

export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  ExternalServiceError,
  ERROR_CATEGORIES,
  ERROR_CODES
};

export default {
  formatErrorResponse,
  logError,
  createError,
  asyncHandler,
  globalErrorHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  ExternalServiceError,
  ERROR_CATEGORIES,
  ERROR_CODES
};