import { ShipmentStatus } from "./shipmentTypes";

/** Pagination query parameters interface */
export interface PaginationParams {
    page: number;
    limit: number;
};

/** Sorting query params */
export interface SortParams { 
    sortBy: string;
    order: 'asc' | 'desc';
}

/** Filter parameters for shipments */
export interface ShipmentFilterParams { 
    status?: ShipmentStatus;
    origin?: string;
    destination?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
};

/** Combined query params for listing shipments */
export interface QueryParams extends PaginationParams, SortParams {
    filters: ShipmentFilterParams;
};

/** Pagination metadata returned in responses */
export interface PaginationMeta { 
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

/** Paginated response structure */
export interface PaginatedResponse<T> { 
    data: T[];
    pagination: PaginationMeta;
};

/** Default pagination values */
export const DEFAULT_PAGINATION: PaginationParams = { 
    page: 1,
    limit: 10,
};

/** Default sorting values */
export const DEFAULT_SORT: SortParams = { 
    sortBy: 'createdAt',
    order: 'desc',
};

/** Maximum allowed limit for pagination */
export const MAX_LIMIT = 100;