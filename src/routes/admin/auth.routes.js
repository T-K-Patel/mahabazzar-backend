import { Router } from "express";
import { captchaMiddleware } from "../../middlewares/captcha.middleware.js";

const adminAuthRoutes = Router();

// Auth Routes
adminAuthRoutes.route("/login").post(captchaMiddleware, (req, res) => {
    res.send("Admin Login Route");
});
adminAuthRoutes.route("/logout").post((req, res) => {
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

export default adminAuthRoutes;
