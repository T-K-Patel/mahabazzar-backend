import { Router } from "express";
import UserRoutes from "./user.routes.js";

const V1_ROUTES = Router();

V1_ROUTES.use("/users", UserRoutes);

export default V1_ROUTES;
