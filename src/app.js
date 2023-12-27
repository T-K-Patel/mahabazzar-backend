import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import CONFIG from "./app.config.js";
import path from "path";
import authMiddleware from "./middlewares/auth.middleware.js";
import { ApiError } from "./utils/ApiError.js";
import asyncHandler from "./utils/asyncHandler.js";

// Routes import
import V1_ROUTES from "./routes/v1.routes.js";

const app = express();

// app.use(
//     cors({
//         origin: CONFIG.CORS_ORIGIN,
//         credentials: true,
//     })
// );

app.set('view engine', 'ejs');
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.get("/ex", function (req, res) {
    res.render('index', { data: 'T K Patel' });
})

const VERSION_ROUTER = Router();
VERSION_ROUTER.use("/v1", V1_ROUTES);
VERSION_ROUTER.use(
    "*",
    asyncHandler(async (req, res) => {
        throw new ApiError(404, "Invalid Url or Method");
    })
);

// Routes Declaration
app.use("/api", VERSION_ROUTER);
app.use("/_admin", authMiddleware, (req, res) => {
    res.sendFile(path.join(process.cwd(), "/admin/index.html"));
});
app.use("/*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "/public/index.html"));
});

export { app };
