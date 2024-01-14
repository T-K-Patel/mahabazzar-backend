import express, { Router } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

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
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

const VERSION_ROUTER = Router();
VERSION_ROUTER.use("/v1", V1_ROUTES);

// Routes Declaration
app.use("/api", VERSION_ROUTER);

app.all("*", (req, res) => {
    res.format({
        "text/html": () => {
            res.send(
                `<h3 style="margin:20px 10px;font-weight: normal;font-family: monospace;">Cannot ${req.method} <code style="padding:3px; border-radius:5px; background: #e3e3e3;">${req.path}</code></h3>`
            );
        },
        "application/json": () => {
            res.status(404).json({
                status: 404,
                message: `Cannot ${req.method} ${req.path}`,
                success: false,
            });
        },
        default: () => {
            res.send(`Cannot ${req.method} ${req.path}`);
        },
    });
});

export { app };
