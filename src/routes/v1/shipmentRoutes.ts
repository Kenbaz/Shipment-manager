import { Router } from "express";
import { shipmentController } from "../../controllers/index";
import {
  asyncHandler,
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/index";
import {
  createShipmentSchema,
  updateShipmentSchema,
  shipmentIdSchema,
  listShipmentsQuerySchema,
} from "../../validators/index";


const router = Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Shipment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique shipment ID
 *           example: 507f1f77bcf86cd799439011
 *         trackingNumber:
 *           type: string
 *           description: Auto-generated tracking number
 *           example: SHP-20241209-A1B2C3D4
 *         senderName:
 *           type: string
 *           description: Name of the sender
 *           example: John Doe
 *         receiverName:
 *           type: string
 *           description: Name of the receiver
 *           example: Jane Smith
 *         origin:
 *           type: string
 *           description: Origin address
 *           example: Lagos, Nigeria
 *         destination:
 *           type: string
 *           description: Destination address
 *           example: Abuja, Nigeria
 *         status:
 *           type: string
 *           enum: [pending, in_transit, delivered, cancelled]
 *           description: Current shipment status
 *           example: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     CreateShipment:
 *       type: object
 *       required:
 *         - senderName
 *         - receiverName
 *         - origin
 *         - destination
 *       properties:
 *         senderName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: John Doe
 *         receiverName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Jane Smith
 *         origin:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *           example: Lagos, Nigeria
 *         destination:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *           example: Abuja, Nigeria
 *         status:
 *           type: string
 *           enum: [pending, in_transit, delivered, cancelled]
 *           default: pending
 *     
 *     UpdateShipment:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         senderName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         receiverName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         origin:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *         destination:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *         status:
 *           type: string
 *           enum: [pending, in_transit, delivered, cancelled]
 *     
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 5
 *         totalItems:
 *           type: integer
 *           example: 50
 *         itemsPerPage:
 *           type: integer
 *           example: 10
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           example: false
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validation failed
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: VALIDATION_ERROR
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   message:
 *                     type: string
 */


/**
 * @swagger
 * /api/v1/shipments:
 *   get:
 *     summary: Get all shipments
 *     description: Retrieve a paginated list of shipments with optional filtering and sorting
 *     tags: [Shipments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, senderName, receiverName, origin, destination, status, trackingNumber]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_transit, delivered, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         description: Filter by origin (partial match)
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination (partial match)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in sender/receiver names
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter shipments created after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter shipments created before this date
 *     responses:
 *       200:
 *         description: List of shipments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shipments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shipment'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    "/",
    validateQuery(listShipmentsQuerySchema),
    asyncHandler(shipmentController.getAll.bind(shipmentController))
);

/**
 * @swagger
 * /api/v1/shipments/{id}:
 *   get:
 *     summary: Get a shipment by ID
 *     description: Retrieve a single shipment by its ID
 *     tags: [Shipments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Shipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shipment retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Shipment not found
 */
router.get(
    '/:id',
    validateParams(shipmentIdSchema),
    asyncHandler(shipmentController.getById.bind(shipmentController))
);

/**
 * @swagger
 * /api/v1/shipments:
 *   post:
 *     summary: Create a new shipment
 *     description: Create a new shipment with the provided data
 *     tags: [Shipments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShipment'
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shipment created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    validateBody(createShipmentSchema),
    asyncHandler(shipmentController.create.bind(shipmentController))
);

/**
 * @swagger
 * /api/v1/shipments/{id}:
 *   put:
 *     summary: Update a shipment
 *     description: Update an existing shipment. Status transitions are validated.
 *     tags: [Shipments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShipment'
 *     responses:
 *       200:
 *         description: Shipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shipment updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Validation error or invalid status transition
 *       404:
 *         description: Shipment not found
 */
router.put(
    '/:id',
    validateParams(shipmentIdSchema),
    validateBody(updateShipmentSchema),
    asyncHandler(shipmentController.update.bind(shipmentController))
);

/**
 * @swagger
 * /api/v1/shipments/{id}:
 *   delete:
 *     summary: Delete a shipment
 *     description: Delete a shipment by its ID
 *     tags: [Shipments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Shipment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shipment deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Shipment not found
 */
router.delete(
    '/:id',
    validateParams(shipmentIdSchema),
    asyncHandler(shipmentController.delete.bind(shipmentController))
);

export const shipmentRoutes = router;