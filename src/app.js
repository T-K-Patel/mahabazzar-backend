import ENV_CONFIG from "./app.config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import ErrorHandler from "./Errors/ErrorHandler.js";
import NotFoundHandler from "./Errors/NotFoundHandler.js";

// Routes import
import V1_ROUTES from "./routes/v1.routes.js";

const app = express();

app.use(
    cors({
        origin: ENV_CONFIG.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
// app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
    session({
        secret: ENV_CONFIG.SESSION_SECRET,
        resave: false,
        cors: {
            origin: ENV_CONFIG.CORS_ORIGIN,
            credentials: true,
        },
        name: "session",
        saveUninitialized: true,
        cookie: {
            secure: true,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24,
        },
        store: MongoStore.create({
            mongoUrl: `${ENV_CONFIG.MONGODB_URL}/${ENV_CONFIG.SESSION_DB_NAME}`,
        }),
    })
);
// app.use((req, res, next) => {
//     console.log(req.session)
//     next();
// });
app.get("/", (req, res) => {
    res.send("<h1>Backend is running well!!</h1>");
});

// Routes Declaration
app.use("/api", V1_ROUTES);

// Error 404 Handling
app.use(NotFoundHandler);

// Error Handling Middleware
app.use(ErrorHandler);

export { app };
