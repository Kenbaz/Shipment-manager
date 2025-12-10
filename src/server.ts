import { app } from "./app";
import { database, environment } from "./config/index";
import { setupErrorListeners } from "./middlewares/index";
import http from "http";


// Server instance
let server: http.Server;

/**
 * Graceful shutdown handler
 * Closes server and database connections properly
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    if (server) {
        server.close((err) => {
            if (err) {
                console.error("Error closing server:", err);
                process.exit(1);
            }
            console.log("Server closed - no longer accepting connections");
        });
    };

    try {
        // Disconnect from the database
        await database.disconnect();
        console.log("Database connection closed");
        console.log("Shutdown complete. Exiting now.");
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
};


/** Start the server */
const startServer = async (): Promise<void> => {
    try {
        // Setup global error listeners
        setupErrorListeners();

        // Connect to the database
        console.log("Connecting to database...");
        await database.connect();
        console.log("Database connected successfully");

        // Start the HTTP server
        server = app.listen(environment.port, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Server is running in ${environment.nodeEnv} mode`);
            console.log(`📡 Listening on port ${environment.port}`);
            console.log(`🌐 Base URL: http://localhost:${environment.port}`);
            console.log(`📚 API Docs: http://localhost:${environment.port}/api-docs`);
            console.log(`❤️  Health:   http://localhost:${environment.port}/health`);
            console.log('='.repeat(50));
        });

        // Handle server errors
        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${environment.port} is already in use`);
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });

        // Setup graceful shutdown handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught promise rejections
        process.on('unhandledRejection', (reason: unknown) => {
            console.error('❌ Unhandled Rejection:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error: Error) => {
            console.error('❌ Uncaught Exception:', error);
            // Exit immediately for uncaught exceptions
            process.exit(1);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

export { server };