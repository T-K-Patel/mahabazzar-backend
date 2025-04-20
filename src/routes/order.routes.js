import { Router } from "express";
import OrderController from "../controllers/orders.controller.js";
import User from "../models/user.model.js";

const OrderRoutes = Router();

// OrderRoutes.route("/add-new").post(OrderController.addOrder);
OrderRoutes.route("/:order_id").get(OrderController.getOrderDetails);
// OrderRoutes.route("/add-order");
// OrderRoutes.route("/cancel-order");

export default OrderRoutes;
