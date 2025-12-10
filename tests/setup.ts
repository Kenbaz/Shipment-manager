import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

/**
 * Setup before all tests
 * Creates an in-memory MongoDB instance
 */
beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // connect to in-memory database
    await mongoose.connect(mongoUri);
});

/**
 * Cleanup after each test
 * Clears all collections to ensure test isolation
 */
afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            if (collection) {
                await collection.deleteMany({});
            }
        }
    }
});

/**
 * Cleanup after all tests
 * Disconnects from database and stops the server
 */
afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    };
    if (mongoServer) {
        await mongoServer.stop();
    }
});

// Setting test environment
process.env['NODE_ENV'] = 'test';