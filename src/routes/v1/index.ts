import { Router } from "express";
import { shipmentRoutes } from "./shipmentRoutes";

const router = Router();

// Mount shipment routes
router.use("/shipments", shipmentRoutes);

export const v1Routes = router;
