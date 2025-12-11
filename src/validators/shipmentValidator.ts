import Joi from "joi";
import { ShipmentStatusEnum, SHIPMENT_STATUSES } from "../types/index";

/**
 * Validation schema for creating a new shipment
 * All fields except status are required
 */
export const createShipmentSchema = Joi.object({
  senderName: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "Sender name must be a string",
    "string.empty": "Sender name is required",
    "string.min": "Sender name must be at least 2 characters",
    "string.max": "Sender name must be at most 100 characters",
    "any.required": "Sender name is required",
  }),

  receiverName: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "Receiver name must be a string",
    "string.empty": "Receiver name is required",
    "string.min": "Receiver name must be at least 2 characters",
    "string.max": "Receiver name must be at most 100 characters",
    "any.required": "Receiver name is required",
  }),

  origin: Joi.string().trim().min(2).max(200).required().messages({
    "string.base": "Origin must be a string",
    "string.empty": "Origin is required",
    "string.min": "Origin must be at least 2 characters",
    "string.max": "Origin must be at most 200 characters",
    "any.required": "Origin is required",
  }),

  destination: Joi.string().trim().min(2).max(200).required().messages({
    "string.base": "Destination must be a string",
    "string.empty": "Destination is required",
    "string.min": "Destination must be at least 2 characters",
    "string.max": "Destination must be at most 200 characters",
    "any.required": "Destination is required",
  }),

  status: Joi.string()
    .valid(...SHIPMENT_STATUSES)
    .default(ShipmentStatusEnum.PENDING)
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of: ${SHIPMENT_STATUSES.join(", ")}`,
    }),
});

/**
 * Validation schema for updating an existing shipment
 * All fields are optional, but at least one must be provided
 */
export const updateShipmentSchema = Joi.object({
  senderName: Joi.string().trim().min(2).max(100).messages({
    "string.base": "Sender name must be a string",
    "string.empty": "Sender name cannot be empty",
    "string.min": "Sender name must be at least 2 characters",
    "string.max": "Sender name must be at most 100 characters",
  }),

  receiverName: Joi.string().trim().min(2).max(100).messages({
    "string.base": "Receiver name must be a string",
    "string.empty": "Receiver name cannot be empty",
    "string.min": "Receiver name must be at least 2 characters",
    "string.max": "Receiver name must be at most 100 characters",
  }),

  origin: Joi.string().trim().min(2).max(200).messages({
    "string.base": "Origin must be a string",
    "string.empty": "Origin cannot be empty",
    "string.min": "Origin must be at least 2 characters",
    "string.max": "Origin must be at most 200 characters",
  }),

  destination: Joi.string().trim().min(2).max(200).messages({
    "string.base": "Destination must be a string",
    "string.empty": "Destination cannot be empty",
    "string.min": "Destination must be at least 2 characters",
    "string.max": "Destination must be at most 200 characters",
  }),

  status: Joi.string()
    .valid(...SHIPMENT_STATUSES)
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of: ${SHIPMENT_STATUSES.join(", ")}`,
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Validation schema for shipment ID parameter
 * Validates MongoDB ObjectId format (24 hex characters)
 */
export const shipmentIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.base": "Shipment ID must be a string",
      "string.empty": "Shipment ID is required",
      "string.pattern.base": "Shipment ID must be a valid MongoDB ObjectId",
      "any.required": "Shipment ID is required",
    }),
});

/**
 * Validation schema for query parameters when listing shipments
 */
export const listShipmentsQuerySchema = Joi.object({
  page: Joi.number().integer().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
  }),

  limit: Joi.number().integer().messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
  }),

  sortBy: Joi.string()
    .valid(
      "createdAt",
      "updatedAt",
      "senderName",
      "receiverName",
      "origin",
      "destination",
      "status",
      "trackingNumber"
    )
    .messages({
      "string.base": "sortBy must be a string",
      "any.only":
        "sortBy must be one of: createdAt, updatedAt, senderName, receiverName, origin, destination, status, trackingNumber",
    }),

  order: Joi.string().valid("asc", "desc").messages({
    "string.base": "order must be a string",
    "any.only": 'order must be either "asc" or "desc"',
  }),

  status: Joi.string()
    .valid(...SHIPMENT_STATUSES)
    .messages({
      "string.base": "status must be a string",
      "any.only": `status must be one of: ${SHIPMENT_STATUSES.join(", ")}`,
    }),

  origin: Joi.string().trim().max(200).messages({
    "string.base": "origin must be a string",
    "string.max": "origin filter must be at most 200 characters",
  }),

  destination: Joi.string().trim().max(200).messages({
    "string.base": "destination must be a string",
    "string.max": "destination filter must be at most 200 characters",
  }),

  search: Joi.string().trim().max(100).messages({
    "string.base": "search must be a string",
    "string.max": "search term must be at most 100 characters",
  }),

  startDate: Joi.date().iso().messages({
    "date.base": "startDate must be a valid date",
    "date.format": "startDate must be in ISO 8601 format (e.g., 2024-01-01)",
  }),

  endDate: Joi.date().iso().min(Joi.ref("startDate")).messages({
    "date.base": "endDate must be a valid date",
    "date.format": "endDate must be in ISO 8601 format (e.g., 2024-12-31)",
    "date.min": "endDate must be greater than or equal to startDate",
  }),
});
