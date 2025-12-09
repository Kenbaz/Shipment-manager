import { Router, Request, Response } from "express";
import { database } from "../config/index";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       description: Server uptime in seconds
 *                     database:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                         state:
 *                           type: string
 */
router.get('/', (_req: Request, res: Response) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            connected: database.isConnected(),
            state: database.getConnectionState(),
        },
    };

    res.status(200).json({
        success: true,
        message: 'API is healthy',
        data: healthData,
    });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Checks if the API is ready to accept requests (database connected)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is ready
 *       503:
 *         description: API is not ready (database disconnected)
 */
router.get("/ready", (_req: Request, res: Response) => {
  if (database.isConnected()) {
    res.status(200).json({
      success: true,
      message: "API is ready",
      data: { ready: true },
    });
  } else {
    res.status(503).json({
      success: false,
      message: "API is not ready",
      data: { ready: false, reason: "Database not connected" },
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Simple liveness check - returns 200 if the server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is alive
 */
router.get("/live", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is alive",
    data: { alive: true },
  });
});

export const healthRoutes = router;