import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/index";
import { ApiErrorResponse } from "../types/index";
import { environment } from "../config/index";


/** Handle MongoDB duplicate key errors */
const handleDuplicateKeyError = (error: mongoose.mongo.MongoServerError): ApiError => {
    const keyValue = error["keyValue"] as Record<string, unknown> | undefined;
    const field = Object.keys(keyValue || {})[0] || 'field';
    const value = keyValue ? keyValue[field] : 'unknown';
    return ApiError.conflict(`Duplicate value for ${field}: ${String(value)}`);
};


/** Handles Mongoose validation errors */
const handleValidationError = (error: mongoose.Error.ValidationError): ApiError => {
    const details = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
    }));
    return ApiError.badRequest('Validation failed', details);
};


/** Handles Mongoose CastError (invalid ObjectId, etc.) */
const handleCastError = (error: mongoose.Error.CastError): ApiError => {
    return ApiError.invalidId(`Invalid ${error.path}: ${String(error.value)}`);
};


/** Handles JSON parsing errors */
const handleSyntaxError = (_error: SyntaxError & { status?: number }): ApiError => {
    return ApiError.badRequest('Invalid JSON in request body');
};


/** Converts any error to an ApiError for consistent response format */
const normalizeError = (error: Error): ApiError => {
    // Already an ApiError
    if (error instanceof ApiError) {
        return error;
    }

    // MongoDB duplicate key error
    if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
    ) {
        return handleDuplicateKeyError(error);
    }

    // Mongoose validation error
    if (error instanceof mongoose.Error.ValidationError) {
        return handleValidationError(error);
    }

    // Mongoose cast error (invalid ObjectId)
    if (error instanceof mongoose.Error.CastError) {
        return handleCastError(error);
    }

    // JSON syntax error
    if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
        return handleSyntaxError(error as SyntaxError & { status?: number });
    }

    // Default to internal server error
    return ApiError.internal(
        environment.isProduction ? 'An unexpected error occurred' : error.message
    );
};


/**
 * Global error handling middleware
 * Catches all errors and returns consistent JSON responses */
export const errorHandler: ErrorRequestHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log error in development
    if (!environment.isProduction && !environment.isTest) {
      console.error("Error:", error);
    }

    // Normalize the error to ApiError
    const apiError = normalizeError(error);

    // Build error response
    const errorResponse: ApiErrorResponse = {
        success: false,
        message: apiError.message,
        error: {
            code: apiError.code,
            ...(apiError.details && { details: apiError.details }),
        },
    };

    // Include stack trace in development
    if (!environment.isProduction && error.stack) {
        (errorResponse as ApiErrorResponse & { stack?: string }).stack = error.stack;
    }

    res.status(apiError.statusCode).json(errorResponse);
};


/** Handle 404 Not Found for unmatched routes */
export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const error = ApiError.notFound(`Route ${req.method} ${req.originalUrl}`);
    next(error);
};


/**
 * Handle uncaught exceptions and unhandled rejections
 * Should be called during app initialization */
export const setupErrorListeners = (): void => {
    process.on('uncaughtException', (error: Error) => {
        console.error('Uncaught Exception:', error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
        console.error('Unhandled Rejection:', reason);
        process.exit(1);
    });
};