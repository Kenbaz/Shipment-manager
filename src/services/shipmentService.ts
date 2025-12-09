import { Types } from "mongoose";
import { shipmentRepository } from "../repositories/index";
import {
    ShipmentDocument,
    CreateShipmentDTO,
    UpdateShipmentDTO,
    ShipmentResponse,
    QueryParams,
    PaginatedResponse,
    ShipmentFilterParams,
    DEFAULT_PAGINATION,
    DEFAULT_SORT,
    MAX_LIMIT,
    ShipmentStatus,
    ShipmentStatusEnum,
} from '../types/index';
import {
    isValidStatusTransition,
    getAllowedTransitions,
} from '../utils/index';
import { ApiError } from "../utils/ApiError";


/** Interface for raw query params from the request */
export interface RawQueryParams {
    page?: string;
    limit?: string;
    sortBy?: string;
    order?: string;
    status?: string;
    origin?: string;
    destination?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
};


/** Shipment service interface defining all business operations */
interface ShipmentServiceInterface { 
    createShipment(data: CreateShipmentDTO): Promise<ShipmentResponse>;
    getShipmentById(id: string): Promise<ShipmentResponse>;
    getShipmentByTrackingNumber(trackingNumber: string): Promise<ShipmentResponse>;
    updateShipment(id: string, data: UpdateShipmentDTO): Promise<ShipmentResponse>;
    deleteShipment(id: string): Promise<ShipmentResponse>;
    listShipments(queryParams: RawQueryParams): Promise<PaginatedResponse<ShipmentResponse>>;
};


/**
 * Shipment Service class implementing business logic layer
 * Handles validation, status transitions, and data transformation
 */
class ShipmentService implements ShipmentServiceInterface {
  /**
   * Validates if the provided string is a valid MongoDB ObjectId
   * @param id - The ID string to validate
   * @throws ApiError if the ID is invalid
   */
  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.invalidId(`Invalid shipment ID: ${id}`);
    }
  }

  /**
   * Transforms a Shipment document to a response object
   * Converts MongoDB document to a clean API response format
   */
  private toResponse(shipment: ShipmentDocument): ShipmentResponse {
    return {
      id: shipment._id.toString(),
      trackingNumber: shipment.trackingNumber,
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      createdAt: shipment.createdAt.toISOString(),
      updatedAt: shipment.updatedAt.toISOString(),
    };
  }

  /**
   * Parses and validates query parameters for listing shipments
   * Applies defaults and enforces constraints
   */
  private parseQueryParams(rawParams: RawQueryParams): QueryParams {
    // parse pagination with defaults
    let page = parseInt(rawParams.page || "", 10);
    let limit = parseInt(rawParams.limit || "", 10);

    // Apply default pagination if invalid
    if (isNaN(page) || page < 1) {
      page = DEFAULT_PAGINATION.page;
    }

    if (isNaN(limit) || limit < 1) {
      limit = DEFAULT_PAGINATION.limit;
    }

    // Enforce maximum limit
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    // parse sorting with defaults
    const sortBy = rawParams.sortBy || DEFAULT_SORT.sortBy;
    const order = rawParams.order === "asc" ? "asc" : "desc";

    // Validate sortby field
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "origin",
      "destination",
      "status",
      "senderName",
      "receiverName",
      "trackingNumber",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      throw ApiError.invalidQueryParams(
        `Invalid sortBy field: ${sortBy}. Allowed fields: ${allowedSortFields.join(
          ", "
        )}`
      );
    }

    // parse filters
    const filters: ShipmentFilterParams = {};

    if (rawParams.status) {
      // Validate status
      const validStatuses = Object.values(ShipmentStatusEnum);
      if (!validStatuses.includes(rawParams.status as ShipmentStatus)) {
        throw ApiError.invalidQueryParams(
          `Invalid status filter: ${
            rawParams.status
          }. Valid statuses: ${validStatuses.join(", ")}`
        );
      }
      filters.status = rawParams.status as ShipmentStatus;
    }

    if (rawParams.origin) {
      filters.origin = rawParams.origin.trim();
    }

    if (rawParams.destination) {
      filters.destination = rawParams.destination.trim();
    }

    if (rawParams.search) {
      filters.search = rawParams.search.trim();
    }

    // Validate and parse date filters
    if (rawParams.startDate) {
      const startDate = new Date(rawParams.startDate);
      if (isNaN(startDate.getTime())) {
        throw ApiError.invalidQueryParams(
          `Invalid startDate format: ${rawParams.startDate}. Use ISO 8601 format (e.g., 2024-01-01)`
        );
      }
      filters.startDate = rawParams.startDate;
    }

    if (rawParams.endDate) {
      const endDate = new Date(rawParams.endDate);
      if (isNaN(endDate.getTime())) {
        throw ApiError.invalidQueryParams(
          `Invalid endDate format: ${rawParams.endDate}. Use ISO 8601 format (e.g., 2024-12-31)`
        );
      }
      filters.endDate = rawParams.endDate;
    }

    // Validate date range logic
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      if (start > end) {
        throw ApiError.invalidQueryParams("startDate cannot be after endDate");
      }
    }

    return {
      page,
      limit,
      sortBy,
      order,
      filters,
    };
  }

  /**
   * Validates status transition when updating a shipment
   * @param currentStatus - Current status of the shipment
   * @param newStatus - Requested new status
   * @throws ApiError if the transition is invalid
   */
  private validateStatusTransition(
    currentStatus: ShipmentStatus,
    newStatus: ShipmentStatus
  ): void {
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      const allowedTransitions = getAllowedTransitions(currentStatus);
      throw ApiError.invalidStatusTransition(
        currentStatus,
        newStatus,
        allowedTransitions
      );
    }
  }

  /**
   * Creates a new shipment
   * @param data - Shipment creation data
   * @returns Created shipment response
   */
  async createShipment(data: CreateShipmentDTO): Promise<ShipmentResponse> {
    // Set default status if not provided
    const shipmentData: CreateShipmentDTO = {
      ...data,
      status: data.status || ShipmentStatusEnum.PENDING,
    };

    // If status is provided, validate it's a valid status value
    if (data.status) {
      const validStatuses = Object.values(ShipmentStatusEnum);
      if (!validStatuses.includes(data.status)) {
        throw ApiError.badRequest(`Invalid status: ${data.status}`, [
          {
            field: "status",
            message: `Status must be one of: ${validStatuses.join(", ")}`,
          },
        ]);
      }
    }

    const shipment = await shipmentRepository.create(shipmentData);
    return this.toResponse(shipment);
  }

  /**
   * Retrieves a shipment by its ID
   * @param id - MongoDB ObjectId string
   * @returns Shipment response
   * @throws ApiError if ID is invalid or shipment not found
   */
  async getShipmentById(id: string): Promise<ShipmentResponse> {
    this.validateObjectId(id);

    const shipment = await shipmentRepository.findById(id);

    if (!shipment) {
      throw ApiError.notFound("Shipment");
    }

    return this.toResponse(shipment);
  }

  /**
   * Retrieves a shipment by its tracking number
   * @param trackingNumber - Unique tracking number
   * @returns Shipment response
   * @throws ApiError if shipment not found
   */
  async getShipmentByTrackingNumber(
    trackingNumber: string
  ): Promise<ShipmentResponse> {
    const shipment = await shipmentRepository.findByTrackingNumber(
      trackingNumber
    );

    if (!shipment) {
      throw ApiError.notFound("Shipment");
    }

    return this.toResponse(shipment);
  }

  /**
   * Updates an existing shipment
   * Validates status transitions if status is being changed
   * @param id - MongoDB ObjectId string
   * @param data - Update data
   * @returns Updated shipment response
   * @throws ApiError if validation fails or shipment not found
   */
  async updateShipment(
    id: string,
    data: UpdateShipmentDTO
  ): Promise<ShipmentResponse> {
    this.validateObjectId(id);

    const existingShipment = await shipmentRepository.findById(id);

    if (!existingShipment) {
      throw ApiError.notFound("Shipment");
    }

    // Validate status transition if status is being changed
    if (data.status && data.status !== existingShipment.status) {
      this.validateStatusTransition(existingShipment.status, data.status);
    }

    // Perform the update
    const updatedShipment = await shipmentRepository.update(id, data);

    if (!updatedShipment) {
      throw ApiError.notFound("Shipment");
    }

    return this.toResponse(updatedShipment);
  }

  /**
   * Deletes a shipment by its ID
   * @param id - MongoDB ObjectId string
   * @returns Deleted shipment response
   * @throws ApiError if ID is invalid or shipment not found
   */
  async deleteShipment(id: string): Promise<ShipmentResponse> {
    this.validateObjectId(id);

    const deletedShipment = await shipmentRepository.delete(id);

    if (!deletedShipment) {
      throw ApiError.notFound("Shipment");
    }

    return this.toResponse(deletedShipment);
  }

  /**
   * Lists shipments with pagination, filtering, and sorting
   * @param rawParams - Raw query parameters from request
   * @returns Paginated list of shipment responses
   */
  async listShipments(
    rawParams: RawQueryParams
  ): Promise<PaginatedResponse<ShipmentResponse>> {
    // Parse and validate query parameters
    const queryParams = this.parseQueryParams(rawParams);

    // Fetch paginated data from repository
    const result = await shipmentRepository.list(queryParams);

    // Transform documents to response format
    const shipmentResponses = result.data.map((shipment) =>
      this.toResponse(shipment)
    );

    return {
      data: shipmentResponses,
      pagination: result.pagination,
    };
  }
};

export const shipmentService = new ShipmentService();