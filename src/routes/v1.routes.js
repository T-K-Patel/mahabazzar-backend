import { Router } from "express";
import UserRoutes from "./user.routes.js";
import OrderRoutes from "./order.routes.js";
import ProductRoutes from "./product.routes.js";

const V1_ROUTES = Router();

V1_ROUTES.use("/users", UserRoutes);
// V1_ROUTES.use("/orders", OrderRoutes);
// V1_ROUTES.use("/products", ProductRoutes);

export default V1_ROUTES;
