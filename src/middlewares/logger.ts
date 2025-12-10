import morgan from "morgan";
import { environment } from "../config/index";
import { Request, Response } from "express";

/**
 * Custom token for response time in a cleaner format
 */
morgan.token("response-time-ms", (_req: Request, res: Response): string => {
  const responseTime = res.getHeader("X-Response-Time");
  if (responseTime) {
    return `${responseTime}`;
  }
  return "-";
});

/**
 * Custom token for request body (only in development, and only for non-GET requests)
 */
morgan.token("body", (req: Request): string => {
  if (environment.isDevelopment && req.method !== "GET" && req.body) {
    const body = JSON.stringify(req.body);
    // Truncate long bodies
    return body.length > 200 ? `${body.substring(0, 200)}...` : body;
  }
  return "";
});

/**
 * Custom token for error messages
 */
morgan.token("error-message", (_req: Request, res: Response): string => {
  return res.locals["errorMessage"] || "";
});

/**
 * Development format - verbose logging with colors
 */
const developmentFormat =
  ":method :url :status :response-time ms - :res[content-length] :body";

/**
 * Production format - concise logging for log aggregation
 */
const productionFormat =
  ":remote-addr - :method :url :status :response-time ms - :res[content-length]";

/**
 * Combined format for detailed logging
 */
const combinedFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Get the appropriate Morgan format based on environment
 */
const getFormat = (): string => {
  switch (environment.logLevel) {
    case "combined":
      return combinedFormat;
    case "dev":
      return developmentFormat;
    case "tiny":
      return "tiny";
    case "short":
      return "short";
    default:
      return environment.isProduction ? productionFormat : developmentFormat;
  }
};

/**
 * Skip logging for certain requests (e.g., health checks in production)
 */
const skipFunction = (req: Request, _res: Response): boolean => {
  // Skip health check endpoints in production to reduce log noise
  if (environment.isProduction) {
    return req.url.startsWith("/health");
  }
  return false;
};

/**
 * Morgan middleware configured for the current environment
 */
export const loggerMiddleware = morgan(getFormat(), {
  skip: skipFunction,
  stream: {
    write: (message: string): void => {
      // Remove trailing newline and log
      console.log(message.trim());
    },
  },
});

/**
 * Morgan middleware for error logging only
 * Logs only 4xx and 5xx responses
 */
export const errorLoggerMiddleware = morgan(getFormat(), {
  skip: (_req: Request, res: Response): boolean => {
    return res.statusCode < 400;
  },
  stream: {
    write: (message: string): void => {
      console.error(message.trim());
    },
  },
});
