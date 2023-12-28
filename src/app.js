import express, { Router } from "express";
import cookieParser from "cookie-parser";
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

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

const VERSION_ROUTER = Router();
VERSION_ROUTER.use("/v1", V1_ROUTES);


// Routes Declaration
app.use("/api", VERSION_ROUTER);

app.use("*", (req, res) => {
    asyncHandler(async (req, res) => {
        throw new ApiError(404, "Invalid Url or Method");
    })
})

export { app };
