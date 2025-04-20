import { Router } from "express";
import AuthController from "../controllers/auth.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { captchaMiddleware } from "../middlewares/captcha.middleware.js";

const AuthRoutes = Router();

AuthRoutes.route("/register").post(
    // upload.single("avatar"),
    AuthController.registerUser
);
AuthRoutes.route("/login").post(captchaMiddleware, AuthController.loginUser);
AuthRoutes.route("/logout").post(authMiddleware, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({
                message: "Something went wrong while logging out",
            });
        } else {
            res.status(200).json({
                message: "Logged out successfully",
            });
        }
    });
});

export default AuthRoutes;
