import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  quiet: process.env["NODE_ENV"] === "test",
});

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  corsOrigin: string | string[];
  logLevel: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

const getEnvString = (key: string, defaultValue: string): string => {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
    const value = process.env[key];
    if (value === undefined) {
        return defaultValue;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

const parseCorsOrigin = (origin: string): string | string[] => {
  if (origin === "*") {
    return "*";
  }
  const origins = origin.split(",").map((o) => o.trim());
  return origins.length === 1 ? origins[0]! : origins;
};

const nodeEnv = getEnvString('NODE_ENV', 'development');

export const environment: EnvironmentConfig = {
    nodeEnv,
    port: getEnvNumber('PORT', 3000),
    mongodbUri: getEnvString('MONGODB_URI', ''),
    rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
    rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    corsOrigin: parseCorsOrigin(getEnvString('CORS_ORIGIN', '*')),
    logLevel: getEnvString('LOG_LEVEL', 'dev'),
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    isTest: nodeEnv === 'test',
};
