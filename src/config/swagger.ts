import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { environment } from "./enviroment";

/**
 * Swagger/OpenAPI specification options
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shipment Management API",
      version: "1.0.0",
      description: `
A production-ready RESTful API for managing shipments.

## Features
- Full CRUD operations for shipments
- Pagination, filtering, and sorting
- Status transition validation
- Request validation with detailed error messages
- Rate limiting and security headers

## Status Transitions
Shipments follow a specific lifecycle:
- **pending** → in_transit, cancelled
- **in_transit** → delivered, cancelled
- **delivered** → (final state)
- **cancelled** → (final state)

## Authentication
This API currently does not require authentication. Future versions may include JWT-based auth.
            `,
      contact: {
        name: "API Support",
        email: "",
      },
      license: {
        name: "ISC",
        url: "https://opensource.org/licenses/ISC",
      },
    },
    servers: [
      {
        url: `http://localhost:${environment.port}`,
        description: "Development server",
      },
      {
        url: "https://production-url.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Shipments",
        description: "Shipment management endpoints",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
    ],
    components: {
      responses: {
        BadRequest: {
          description: "Bad request - validation error or invalid input",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        TooManyRequests: {
          description: "Rate limit exceeded",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "Too many requests, please try again later",
                  },
                  error: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                        example: "RATE_LIMIT_EXCEEDED",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        InternalError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/routes/**/*.ts"],
};

/**
 * Generate Swagger specification
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Swagger UI options
 */
const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Shipment API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
};

/**
 * Setup Swagger documentation routes
 * @param app - Express application instance
 */
export const setupSwagger = (app: Express): void => {
  // Serve Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  // Serve raw OpenAPI spec as JSON
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `📚 Swagger documentation available at http://localhost:${environment.port}/api-docs`
  );
};

export { swaggerSpec };
