import mongoose, { Schema, Model } from "mongoose";
import { 
    ShipmentDocument,
    ShipmentStatusEnum,
    SHIPMENT_STATUSES,
} from '../types/index';


const shipmentSchema = new Schema<ShipmentDocument>(
    {
        trackingNumber: {
            type: String,
            required: [true, 'Tracking number is required'],
            unique: true,
            trim: true,
            index: true,
        },
        senderName: {
            type: String,
            required: [true, 'Sender name is required'],
            trim: true,
            minLength: [2, 'Sender name must be at least 2 characters'],
            maxLength: [100, 'Sender name must be at most 100 characters'],
        },
        receiverName: {
            type: String,
            required: [true, 'Receiver name is required'],
            trim: true,
            minLength: [2, 'Receiver name must be at least 2 characters'],
            maxLength: [100, 'Receiver name must be at most 100 characters'],
        },
        origin: {
            type: String,
            required: [true, 'Origin address is required'],
            trim: true,
            minLength: [2, 'Origin address must be at least 2 characters'],
            maxLength: [200, 'Origin address must be at most 200 characters'],
        },
        destination: {
            type: String,
            required: [true, 'Destination address is required'],
            trim: true,
            minLength: [2, 'Destination address must be at least 2 characters'],
            maxLength: [200, 'Destination address must be at most 200 characters'],
        },
        status: {
            type: String,
            required: [true, 'Shipment status is required'],
            enum: {
                values: SHIPMENT_STATUSES,
                message: 'Status must be one of: pending, in_transit, delivered, cancelled',
            },
            default: ShipmentStatusEnum.PENDING,
            index: true,
        },
    },

    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (_doc, ret: Record<string, unknown>) => {
                ret['id'] = String(ret['_id']);
                delete ret['_id'];
                return ret;
            },
        },
        toObject: {
            transform: (_doc, ret: Record<string, unknown>) => {
                ret['id'] = String(ret['_id']);
                delete ret['_id'];
                return ret;
            },
        },
    }
);

// Compound indexes for common queries
shipmentSchema.index({ status: 1, createdAt: -1 });
shipmentSchema.index({ originAddress: 1, destinationAddress: 1 });
shipmentSchema.index({ senderName: 'text', receiverName: 'text' });


export const ShipmentModel: Model<ShipmentDocument> = mongoose.model<ShipmentDocument>(
    'Shipment',
    shipmentSchema
);