import { Router } from "express";
import OrderController from "../controllers/orders.controller.js";

const OrderRoutes = Router();

OrderRoutes.route("/add-new").post(OrderController.addOrder);

export default OrderRoutes;
