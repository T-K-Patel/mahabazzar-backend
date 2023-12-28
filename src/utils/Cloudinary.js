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

const uploadOnCloudinary = async (file, folder = "images") => {
    try {
        if (!file) return null;
        const instance = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
            folder: folder
        });
        if (!(file instanceof String)) fs.unlinkSync(file);
        return instance;
    } catch (error) {
        if (!(file instanceof String)) fs.unlinkSync(file);
        return null;
    }
};

// TODO: delete from cloudinary function.

export { uploadOnCloudinary };
