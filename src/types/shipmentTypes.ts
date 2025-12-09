import { Document, Types } from "mongoose";

/** Shipment status enum values */
export const ShipmentStatusEnum = {
    PENDING: "pending",
    IN_TRANSIT: "in_transit",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
} as const;

export type ShipmentStatus = (typeof ShipmentStatusEnum)[keyof typeof ShipmentStatusEnum];


export const SHIPMENT_STATUSES: ShipmentStatus[] = [
    ShipmentStatusEnum.PENDING,
    ShipmentStatusEnum.IN_TRANSIT,
    ShipmentStatusEnum.DELIVERED,
    ShipmentStatusEnum.CANCELLED,
];


/** Base Shipment interface */
export interface Shipment {
    trackingNumber: string;
    senderName: string;
    receiverName: string;
    origin: string;
    destination: string;
    status: ShipmentStatus;
    createdAt: Date;
    updatedAt: Date;
};

/** Mongoose Shipment document interface */
export interface ShipmentDocument extends Omit<Shipment, 'createdAt' | 'updatedAt'>, Document { 
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};


/** Data Transfer Object for creating a new shipment */
export interface CreateShipmentDTO {
  senderName: string;
  receiverName: string;
  origin: string;
  destination: string;
  status?: ShipmentStatus;
};

/** Data Transfer Object for updating an existing shipment */
export interface UpdateShipmentDTO {
  senderName?: string;
  receiverName?: string;
  origin?: string;
  destination?: string;
  status?: ShipmentStatus;
};


/** Shipment response object */
export interface ShipmentResponse {
  id: string;
  trackingNumber: string;
  senderName: string;
  receiverName: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
}


/** Valid status transition map
 * Key: current status, Value: array of valid allowed statuses
 */
export const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatusEnum.PENDING]: [
    ShipmentStatusEnum.IN_TRANSIT,
    ShipmentStatusEnum.CANCELLED,
  ],
  [ShipmentStatusEnum.IN_TRANSIT]: [
    ShipmentStatusEnum.DELIVERED,
    ShipmentStatusEnum.CANCELLED,
  ],
  [ShipmentStatusEnum.DELIVERED]: [],
  [ShipmentStatusEnum.CANCELLED]: [],
};