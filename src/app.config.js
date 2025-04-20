import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const ENV_CONFIG = { ...process.env };

ENV_CONFIG.PORT = ENV_CONFIG.PORT || 8000;
ENV_CONFIG.DB_NAME = "mahabazzar-db";
ENV_CONFIG.SESSION_DB_NAME = "mahabazzar-session";
ENV_CONFIG.CORS_ORIGIN = (ENV_CONFIG.CORS_ORIGIN || "");

export default ENV_CONFIG;
