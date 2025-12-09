import { Request, Response } from "express";
import { shipmentService, RawQueryParams } from "../services/index";
import { ApiResponse } from "../utils/index";
import { CreateShipmentDTO, UpdateShipmentDTO } from "../types/index";


/**
 * Shipment Controller
 * Handles HTTP requests and responses for shipment endpoints
 * Delegates business logic to the shipment service
 */
class ShipmentController {
  /**
   * Create a new shipment
   * POST /api/v1/shipments
   */
  async create(req: Request, res: Response): Promise<void> {
    const createData: CreateShipmentDTO = req.body;

    const shipment = await shipmentService.createShipment(createData);

    const response = ApiResponse.created(shipment, "Shipment");
    res.status(201).json(response);
  }

  /**
   * Get all shipments with pagination, filtering, and sorting
   * GET /api/v1/shipments
   */
  async getAll(req: Request, res: Response): Promise<void> {
    // Extract query parameters as strings
    const queryParams: RawQueryParams = {
      page: req.query["page"] as string | undefined,
      limit: req.query["limit"] as string | undefined,
      sortBy: req.query["sortBy"] as string | undefined,
      order: req.query["order"] as string | undefined,
      status: req.query["status"] as string | undefined,
      origin: req.query["origin"] as string | undefined,
      destination: req.query["destination"] as string | undefined,
      search: req.query["search"] as string | undefined,
      startDate: req.query["startDate"] as string | undefined,
      endDate: req.query["endDate"] as string | undefined,
    };

    const result = await shipmentService.listShipments(queryParams);

    const response = ApiResponse.list(
      result.data,
      result.pagination,
      "Shipments"
    );
    res.status(200).json(response);
  }

  /**
   * Get a single shipment by ID
   * GET /api/v1/shipments/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const shipment = await shipmentService.getShipmentById(id as string);

    const response = ApiResponse.fetched(shipment, "Shipment");
    res.status(200).json(response);
  }

  /**
   * Update an existing shipment
   * PUT /api/v1/shipments/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData: UpdateShipmentDTO = req.body;

    const shipment = await shipmentService.updateShipment(
      id as string,
      updateData
    );

    const response = ApiResponse.updated(shipment, "Shipment");
    res.status(200).json(response);
  }

  /**
   * Delete a shipment
   * DELETE /api/v1/shipments/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const shipment = await shipmentService.deleteShipment(id as string);

    const response = ApiResponse.deleted(shipment, "Shipment");
    res.status(200).json(response);
  }
};

export const shipmentController = new ShipmentController();