import { SortOrder } from "mongoose";
import { ShipmentModel } from '../models/index';
import { 
    ShipmentDocument,
    CreateShipmentDTO,
    UpdateShipmentDTO,
    QueryParams,
    PaginatedResponse,
} from '../types/index';
import { generateTrackingNumber } from "../utils/index";


interface ShipmentRepositoryInterface {
    create(data: CreateShipmentDTO): Promise<ShipmentDocument>;
    findById(id: string): Promise<ShipmentDocument | null>;
    findByTrackingNumber(trackingNumber: string): Promise<ShipmentDocument | null>;
    update(id: string, data: UpdateShipmentDTO): Promise<ShipmentDocument | null>;
    delete(id: string): Promise<ShipmentDocument | null>;
    exists(id: string): Promise<boolean>;
    list(queryParams: QueryParams): Promise<PaginatedResponse<ShipmentDocument>>;
};


class ShipmentRepository implements ShipmentRepositoryInterface { 
    /** Create a new shipment */
    async create(data: CreateShipmentDTO): Promise<ShipmentDocument> { 
        const trackingNumber = generateTrackingNumber();

        const shipment = new ShipmentModel({
            ...data,
            trackingNumber,
        });

        return shipment.save();
    };

    /** Find a shipment by its ID */
    async findById(id: string): Promise<ShipmentDocument | null> { 
        return ShipmentModel.findById(id).exec();
    };

    /** Find a shipment by its tracking number */
    async findByTrackingNumber(trackingNumber: string): Promise<ShipmentDocument | null> {
        return ShipmentModel.findOne({ trackingNumber }).exec();
    };

    /** Find all shipments with pagination, filtering, and sorting */
    async list(params: QueryParams): Promise<PaginatedResponse<ShipmentDocument>> { 
        const { page, limit, sortBy, order, filters } = params;

        // Build the query object based on filters
        const query: Record<string, unknown> = {};

        if (filters.status) {
            query['status'] = filters.status;
        };

        if (filters.origin) { 
            query['origin'] = { $regex: filters.origin, $options: 'i' };
        };

        if (filters.destination) { 
            query['destination'] = { $regex: filters.destination, $options: 'i' };
        };

        if (filters.search) {
            query['$or'] = [
                { senderName: { $regex: filters.search, $options: 'i' } },
                { receiverName: { $regex: filters.search, $options: 'i' } },
            ];
        };

        if (filters.startDate || filters.endDate) {
            const createdAtFilter: Record<string, Date> = {};
            if (filters.startDate) {
              createdAtFilter['$gte'] = new Date(filters.startDate);
            }
            if (filters.endDate) {
              createdAtFilter['$lte'] = new Date(filters.endDate);
            }
            query["createdAt"] = createdAtFilter;
        };

        // calculate skip value
        const skip = (page - 1) * limit;

        // Build sort object
        const sortOrder: SortOrder = order === 'asc' ? 1 : -1;
        const sort: Record<string, SortOrder> = { [sortBy]: sortOrder };
        
        // Execute queries in parallel
        const [shipments, totalItems] = await Promise.all([
            ShipmentModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
            ShipmentModel.countDocuments(query).exec(),
        ]);

        // calculate pagination metadata
        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: shipments,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    /** Update a shipment by its ID */
    async update(id: string, data: UpdateShipmentDTO): Promise<ShipmentDocument | null> { 
        return ShipmentModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).exec();
    };

    /** Delete a shipment by its ID */
    async delete(id: string): Promise<ShipmentDocument | null> { 
        return ShipmentModel.findByIdAndDelete(id).exec();
    };

    /** Check if a shipment exists by its ID */
    async exists(id: string): Promise<boolean> { 
        const count = await ShipmentModel.countDocuments({ _id: id }).exec();
        return count > 0;
    };
};

export const shipmentRepository = new ShipmentRepository();