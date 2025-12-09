import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/index';


/** Validation source - where to look for data to validate */
export type ValidationSource = 'body' | 'params' | 'query';


/** Options for the validation middleware */
interface ValidationOptions {
    /** Whether to strip unknown properties from the validated data */
    stripUnknown?: boolean;
    /** Whether to abort early on first error or collect all errors */
    abortEarly?: boolean;
};


// Default validation options
const defaultOptions: ValidationOptions = {
    stripUnknown: true,
    abortEarly: false,
};


/**
 * Creates a validation middleware for the specified source and schema
 * 
 * @param schema - Joi validation schema
 * @param source - Request property to validate (body, params, or query)
 * @param options - Validation options
 * @returns Express middleware function
 */
export const validateRequest = (
    schema: Joi.ObjectSchema,
    source: ValidationSource,
    options: ValidationOptions = {}
) => {
    const mergedOptions = { ...defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
        const dataToValidate = req[source];

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: mergedOptions.abortEarly,
            stripUnknown: mergedOptions.stripUnknown,
            convert: true, // Convert types where possible
        });

        if (error) {
            const details = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/["']/g, ''),
            }));

            const errorMessage = `Validation failed: ${details.map(d => d.message).join(', ')}`;

            next(ApiError.badRequest(errorMessage, details));
            return;
        };

        // Replace the original data with the validated and sanitized data
        req[source] = value;
    };
};


/** Validate req body */
export const validateBody = (
    schema: Joi.ObjectSchema,
    options?: ValidationOptions
) => validateRequest(schema, 'body', options);

/** Validate req params */
export const validateParams = (
    schema: Joi.ObjectSchema,
    options?: ValidationOptions
) => validateRequest(schema, 'params', options);

/** Validate req query */
export const validateQuery = (
    schema: Joi.ObjectSchema,
    options?: ValidationOptions
) => validateRequest(schema, 'query', options);