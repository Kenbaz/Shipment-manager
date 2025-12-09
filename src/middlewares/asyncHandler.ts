import { Request, Response, NextFunction, RequestHandler } from "express";

/** Type for async request handler functions */
type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;


/**
 * Wraps an async function to catch errors and pass them to Express error handler
 * This eliminates the need for try-catch blocks in every controller method
 * 
 * @param fn - Async function to wrap
 * @returns Express middleware that handles errors automatically
 */

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};