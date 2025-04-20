import { Router } from "express";
import adminInventoryRoutes from "./admin/inventory.routes.js";
import adminOrderRoutes from "./admin/order.routes.js";
import adminStatsRoutes from "./admin/stats.routes.js";
import adminAuthRoutes from "./admin/auth.routes.js";

const adminRoutes = Router();

adminRoutes.use("/auth", adminAuthRoutes);
adminRoutes.use("/inventory", adminInventoryRoutes);
adminRoutes.use("/orders", adminOrderRoutes);
adminRoutes.use("/stats", adminStatsRoutes);

export default adminRoutes;
