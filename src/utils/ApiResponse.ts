import {
    ApiSuccessResponse,
    ApiPaginatedResponse,
    PaginationMeta,
} from '../types/index';


/** Utility class for creating consistent API success responses */
export class ApiResponse {
  /** Create a standard success response */
  static success<T>(
    data: T,
    message: string = "Success"
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  /** Create a paginated success response */
  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message: string = "Success"
  ): ApiPaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  /** Create a success response for resource creation */
  static created<T>(
    data: T,
    resourceName: string = "Resource"
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      message: `${resourceName} created successfully`,
      data,
    };
  }

  /** Creates a success response for resource update */
  static updated<T>(
    data: T,
    resourceName: string = "Resource"
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      message: `${resourceName} updated successfully`,
      data,
    };
  }

  /** Creates a success response for resource deletion */
  static deleted<T>(
    data: T,
    resourceName: string = "Resource"
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      message: `${resourceName} deleted successfully`,
      data,
    };
  }

  /** Creates a success response for fetching a single resource */
  static fetched<T>(
    data: T,
    resourceName: string = "Resource"
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      message: `${resourceName} retrieved successfully`,
      data,
    };
  }

  /** Creates a success response for fetching a list of resources */
  static list<T>(
    data: T[],
    pagination: PaginationMeta,
    resourceName: string = "Resources"
  ): ApiPaginatedResponse<T> {
    return {
      success: true,
      message: `${resourceName} retrieved successfully`,
      data,
      pagination,
    };
  }
}