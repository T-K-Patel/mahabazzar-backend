import { Router } from "express";
import AdminOrderController from "../../controllers/admin.orders.controller.js";

const adminOrderRoutes = Router();

// Order Routes
adminOrderRoutes.route("/recent").get(AdminOrderController.getRecentOrders);
adminOrderRoutes.route("/all").get(AdminOrderController.getAllOrders);
adminOrderRoutes
    .route("/incomplete")
    .get(AdminOrderController.getIncompleteOrders);
adminOrderRoutes
    .route("/delivered")
    .get(AdminOrderController.getDeliveredOrders);
adminOrderRoutes.route("/canceled").get(AdminOrderController.getCanceledOrders);
adminOrderRoutes
    .route("/process/:order_id")
    .put(AdminOrderController.processOrder);

export default adminOrderRoutes;
