import request from 'supertest';
import { app } from '../../src/app';

describe('Shipment CRUD Operations', () => {
    const validShipment = {
        senderName: 'John Doe',
        receiverName: 'Jane Smith',
        origin: 'Lagos, Nigeria',
        destination: 'Abuja, Nigeria',
    };

    describe('POST /api/v1/shipments', () => {
        it('should create a new shipment with valid data', async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send(validShipment)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Shipment created successfully');
            expect(response.body.data).toMatchObject({
                senderName: validShipment.senderName,
                receiverName: validShipment.receiverName,
                origin: validShipment.origin,
                destination: validShipment.destination,
                status: 'pending',
            });
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.trackingNumber).toBeDefined();
            expect(response.body.data.trackingNumber).toMatch(/^SHP-\d{8}-[A-Z0-9]{8}$/);
            expect(response.body.data.createdAt).toBeDefined();
            expect(response.body.data.updatedAt).toBeDefined();
        });

        it('should create a shipment with explicit status', async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send({ ...validShipment, status: 'pending' })
                .expect(201);

            expect(response.body.data.status).toBe('pending');
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send({ senderName: 'John Doe' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.details).toBeDefined();
        });

        it('should return 400 for invalid status value', async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send({ ...validShipment, status: 'invalid_status' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should return 400 for senderName too short', async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send({ ...validShipment, senderName: 'J' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('GET /api/v1/shipments', () => {
        beforeEach(async () => {
            // Create test shipments
            await request(app).post('/api/v1/shipments').send(validShipment);
            await request(app).post('/api/v1/shipments').send({
                ...validShipment,
                senderName: 'Alice Johnson',
                receiverName: 'Bob Williams',
            });
        });

        it('should return all shipments with default pagination', async () => {
            const response = await request(app)
                .get('/api/v1/shipments')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.pagination).toMatchObject({
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 2,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
            });
        });

        it('should return empty array when no shipments exist', async () => {
            // Clear shipments using the model's collection
            const { ShipmentModel } = await import('../../src/models/index');
            await ShipmentModel.deleteMany({});

            const response = await request(app)
                .get('/api/v1/shipments')
                .expect(200);

            expect(response.body.data).toHaveLength(0);
            expect(response.body.pagination.totalItems).toBe(0);
        });
    });

    describe('GET /api/v1/shipments/:id', () => {
        let shipmentId: string;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send(validShipment);
            shipmentId = response.body.data.id;
        });

        it('should return a shipment by valid ID', async () => {
            const response = await request(app)
                .get(`/api/v1/shipments/${shipmentId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(shipmentId);
            expect(response.body.data.senderName).toBe(validShipment.senderName);
        });

        it('should return 400 for invalid ID format', async () => {
            const response = await request(app)
                .get('/api/v1/shipments/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should return 404 for non-existent ID', async () => {
            const response = await request(app)
                .get('/api/v1/shipments/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
        });
    });

    describe('PUT /api/v1/shipments/:id', () => {
        let shipmentId: string;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send(validShipment);
            shipmentId = response.body.data.id;
        });

        it('should update a shipment with valid data', async () => {
            const updateData = {
                receiverName: 'Updated Receiver',
                destination: 'Updated Destination',
            };

            const response = await request(app)
                .put(`/api/v1/shipments/${shipmentId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.receiverName).toBe(updateData.receiverName);
            expect(response.body.data.destination).toBe(updateData.destination);
            expect(response.body.data.senderName).toBe(validShipment.senderName);
        });

        it('should return 400 for empty update body', async () => {
            const response = await request(app)
                .put(`/api/v1/shipments/${shipmentId}`)
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should return 400 for invalid ID format', async () => {
            const response = await request(app)
                .put('/api/v1/shipments/invalid-id')
                .send({ senderName: 'Test' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 404 for non-existent ID', async () => {
            const response = await request(app)
                .put('/api/v1/shipments/507f1f77bcf86cd799439011')
                .send({ senderName: 'Test' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
        });
    });

    describe('DELETE /api/v1/shipments/:id', () => {
        let shipmentId: string;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/v1/shipments')
                .send(validShipment);
            shipmentId = response.body.data.id;
        });

        it('should delete a shipment by valid ID', async () => {
            const response = await request(app)
                .delete(`/api/v1/shipments/${shipmentId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Shipment deleted successfully');
            expect(response.body.data.id).toBe(shipmentId);

            // Verify shipment is deleted
            await request(app)
                .get(`/api/v1/shipments/${shipmentId}`)
                .expect(404);
        });

        it('should return 400 for invalid ID format', async () => {
            const response = await request(app)
                .delete('/api/v1/shipments/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 404 for non-existent ID', async () => {
            const response = await request(app)
                .delete('/api/v1/shipments/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
        });
    });
});