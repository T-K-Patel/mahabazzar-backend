import mongoose from "mongoose";
import ENV_CONFIG from "../app.config.js";

const connectDB = async () => {
    try {
        await mongoose.connect(
            `${ENV_CONFIG.MONGODB_URL}/${ENV_CONFIG.DB_NAME}`
        );
        console.log("MONGODB connection established!!");
    } catch (error) {
        console.error("\nMONGODB Connection FAILED\n");
        throw error;
    }
};

export default connectDB;
