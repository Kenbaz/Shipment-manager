import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { environment } from "../config/index";


/** Helmet middleware for security headers */
export const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for Swagger UI
});


/**
 * CORS configuration
 * Configures Cross-Origin Resource Sharing based on environment
 */
const getCorsOptions = (): cors.CorsOptions => {
    const origin = environment.corsOrigin;

    return {
        origin: origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
        credentials: true,
        maxAge: 86400, // 24 hours
        optionsSuccessStatus: 200,
    };
};

export const corsMiddleware = cors(getCorsOptions());

/**
 * Rate limiting middleware
 * Limits the number of requests from a single IP address */
export const rateLimitMiddleware = rateLimit({
    windowMs: environment.rateLimitWindowMs,
    max: environment.rateLimitMaxRequests, // Max requests per window
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            details: [
                {
                    message: `You have exceeded the ${environment.rateLimitMaxRequests} requests in ${environment.rateLimitWindowMs / 60000} minutes limit`,
                },
            ],
        },
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count all requests
    skipFailedRequests: false, // Count failed requests too
    handler: (_req, res, _next, options) => {
        res.status(429).json(options.message);
    },
});

/** Stricter rate limit for authentication endpoints (if needed in future) */
export const authRateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
        error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});