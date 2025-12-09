import { Router } from "express";
import { v1Routes } from "./v1/index";
import {healthRoutes} from "./healthRoutes";

const router = Router();

// Health check routes
router.use("/health", healthRoutes);

// API v1 routes
router.use("/api/v1", v1Routes);

export const routes = router;
