import { ErrorCode, ErrorCodes } from '../types/index';

/**
 * Custom API Error class for consistent error handling
 * Extends the built-in Error class with additional properties for API responses
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    details?: Array<{ field?: string; message: string }>,
    isOperational: boolean = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** Create 400 Bad Request error fro validation failures */
  static badRequest(
    message: string,
    details?: Array<{ field?: string; message: string }>
  ): ApiError {
    return new ApiError(400, message, ErrorCodes.VALIDATION_ERROR, details);
  }

  /** Create 400 Bad request error for invalid MongoDB ObjectId */
  static invalidId(message: string = "Invalid ID format"): ApiError {
    return new ApiError(400, message, ErrorCodes.INVALID_ID);
  }

  /** Create a 400 Bad request error for invalid status transitions */
  static invalidStatusTransition(
    currentStatus: string,
    newStatus: string,
    allowedTransitions: string[]
  ): ApiError {
    let message: string;

    if (allowedTransitions.length === 0) {
      message = `Cannot change status from '${currentStatus}'. This is a final state.`;
    } else {
      message = `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedTransitions.join(
        ", "
      )}`;
    }

    return new ApiError(400, message, ErrorCodes.INVALID_STATUS_TRANSITION, [
      {
        field: "status",
        message: message,
      },
    ]);
  }

  /** Creates a 400 Bad request error for invalid query parameters */
  static invalidQueryParams(
    message: string,
    details?: Array<{ field?: string; message: string }>
  ): ApiError {
    return new ApiError(400, message, ErrorCodes.INVALID_QUERY_PARAMS, details);
  }

  /** Creates a 404 Not Found error */
  static notFound(resource: string = "Resource"): ApiError {
    return new ApiError(
      404,
      `${resource} not found`,
      ErrorCodes.RESOURCE_NOT_FOUND
    );
  }

  /** Creates a 409 Conflict error for duplicate entries */
  static conflict(message: string): ApiError {
    return new ApiError(409, message, ErrorCodes.DUPLICATE_ENTRY);
  }

  /** Creates a 500 Internal Server Error */
  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(
      500,
      message,
      ErrorCodes.INTERNAL_ERROR,
      undefined,
      false
    );
  }

  /** Converts the error to a JSON-serializable object for API responses */
  toJSON(): {
    success: false;
    message: string;
    error: {
      code: ErrorCode;
      details?: Array<{ field?: string; message: string }>;
    };
  } {
    return {
      success: false,
      message: this.message,
      error: {
        code: this.code,
        ...(this.details && { details: this.details }),
      },
    };
  }
}