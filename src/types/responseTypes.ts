import { PaginationMeta } from "./paginationTypes";

/** Base API response structure */
export interface BaseApiResponse {
    success: boolean;
    message: string;
};

/** Success response structure */
export interface ApiSuccessResponse<T> extends BaseApiResponse { 
    success: true;
    data: T;
};

/** Success response structure with pagination */
export interface ApiPaginatedResponse<T> extends BaseApiResponse { 
    success: true;
    data: T[];
    pagination: PaginationMeta;
};

/** Error details structure */
export interface ErrorDetails { 
    code: string;
    details?: Array<{
        field?: string;
        message: string;
    }>;
};

/** Error response structure */
export interface ApiErrorResponse extends BaseApiResponse { 
    success: false;
    error: ErrorDetails;
};

/** Union type for all API responses */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Error codes */
export const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_ID: 'INVALID_ID',
    INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
    INVALID_QUERY_PARAMS: 'INVALID_QUERY_PARAMS',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];


