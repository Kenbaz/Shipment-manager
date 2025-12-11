import express, { Express } from "express";
import { 
    helmetMiddleware,
    corsMiddleware,
    rateLimitMiddleware,
    loggerMiddleware,
    errorHandler,
    notFoundHandler
} from './middlewares/index';
import { routes } from "./routes/index";
import { setupSwagger } from "./config/swagger";
import { environment } from "./config/index";


export const createApp = (): Express => {
    const app = express();

    // Apply security middlewares
    app.use(helmetMiddleware);
    app.use(corsMiddleware);
    
    // Skip rate limiting in test environment
    if (!environment.isTest) {
        app.use(rateLimitMiddleware);
    }

    // Apply request parsing middlewares

    // JSON body parser with size limit
    app.use(express.json({ limit: '10kb' }));

    // URL-encoded body parser
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Apply logging middleware

    // Request logging 
    if (!environment.isTest) {
        app.use(loggerMiddleware);
    }

    // API Documentation
    if (!environment.isTest) {
        setupSwagger(app);
    }

    // Register application routes
    app.use(routes);

    // Root endpoint
    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Shipment Management API is running',
            data: {
                version: '1.0.0',
                documentation: '/api-docs',
                health: '/health',
                endpoints: {
                    shipments: '/api/v1/shipments'
                }
            }
        });
    });

    // Handle 404 - Not Found
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    return app;
};

export const app = createApp();