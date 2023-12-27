import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});
const cloudinary_config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudinary_config);

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        const instance = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
        fs.unlinkSync(filePath);
        return instance;
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
};

// TODO: delete from cloudinary function.

export { uploadOnCloudinary };
