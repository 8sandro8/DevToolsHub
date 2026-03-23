/**
 * Error Handler Middleware
 * Global error handling for Express
 */

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found Error
 */
class NotFoundError extends ApiError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`);
    }
}

/**
 * Validation Error
 */
class ValidationError extends ApiError {
    constructor(message, details = null) {
        super(400, message, details);
    }
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    // Log error
    console.error(`[ERROR] ${new Date().toISOString()}:`, {
        message: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });
    
    // Handle known API errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            error: err.message,
            details: err.details,
            timestamp: new Date().toISOString()
        });
    }
    
    // Handle validation errors from express-validator
    if (err.array && typeof err.array === 'function') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.array(),
            timestamp: new Date().toISOString()
        });
    }
    
    // Handle SQLite errors
    if (err.code && err.code.startsWith('SQLITE_')) {
        return res.status(500).json({
            error: 'Database error',
            message: process.env.NODE_ENV === 'production' 
                ? 'An internal database error occurred' 
                : err.message,
            code: err.code,
            timestamp: new Date().toISOString()
        });
    }
    
    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON in request body',
            timestamp: new Date().toISOString()
        });
    }
    
    // Default server error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message,
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    errorHandler,
    ApiError,
    NotFoundError,
    ValidationError
};
