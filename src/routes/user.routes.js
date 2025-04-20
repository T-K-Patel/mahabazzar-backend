import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const UserRoutes = Router();

UserRoutes.route("/profile").get(UserController.getUserData);

export default UserRoutes;
