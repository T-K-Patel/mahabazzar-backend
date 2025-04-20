import express from "express";
import UserRoutes from "./user.routes.js";
import authMiddleware, {
    adminAuthMiddleware,
} from "../middlewares/auth.middleware.js";
import adminRoutes from "./admin.routes.js";
import AuthRoutes from "./auth.routes.js";
import CaptchaController from "../controllers/captcha.controller.js";
import testingroutes from "./testing.routes.js";

const V1_ROUTES = express.Router();

V1_ROUTES.use("/v1/auth", AuthRoutes);
V1_ROUTES.use("/v1/users", authMiddleware, UserRoutes);
V1_ROUTES.use(
    "/v1/admin",
    // authMiddleware, adminAuthMiddleware,
    adminRoutes
);
V1_ROUTES.get("/v1/captcha/secureimage.png", CaptchaController.getCaptchaImage);

V1_ROUTES.use("/v1", testingroutes);

export default V1_ROUTES;
