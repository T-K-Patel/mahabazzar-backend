import { Router } from "express";
import AdminStatsController from "../../controllers/admin.stats.controller.js";

const adminStatsRoutes = Router();
adminStatsRoutes
    .route("/dashboardStats")
    .get(AdminStatsController.getAccountsStats);

export default adminStatsRoutes;
