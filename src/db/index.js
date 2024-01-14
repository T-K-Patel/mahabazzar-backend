import mongoose from "mongoose";
import CONFIG from "../app.config.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${CONFIG.MONGODB_URL}/${CONFIG.DB_NAME}`
        );
        console.log("MONGODB connection established!!");
    } catch (error) {
        console.error("\nMONGODB Connection FAILED\n");
        process.exit(1);
    }
};

export default connectDB;
