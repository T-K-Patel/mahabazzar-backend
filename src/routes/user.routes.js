import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const UserRoutes = Router();

UserRoutes.route("/register").post(
    upload.single("avatar"),
    UserController.registerUser
);
// UserRoutes.route("/reset-password").post(UserController.resetPassword);
UserRoutes.route("/login").post(UserController.loginUser);
UserRoutes.route("/profile").get(authMiddleware, UserController.getUserData);
UserRoutes.route("/refresh-token").post(UserController.refreshToken);
UserRoutes.route("/logout").get((req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect("/");
});

export default UserRoutes;
