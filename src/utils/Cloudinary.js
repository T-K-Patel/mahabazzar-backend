import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";
import CONFIG from "../app.config.js";

const cloudinary_config = {
    cloud_name: CONFIG.CLOUDINARY_CLOUD_NAME,
    api_key: CONFIG.CLOUDINARY_API_KEY,
    api_secret: CONFIG.CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudinary_config);

const uploadOnCloudinary = async (byteArrayBuffer, folder = "images") => {
    try {
        if (!byteArrayBuffer) return null;
        const instance = await new Promise((resolve) => {
            cloudinary.uploader
                .upload_stream(
                    { folder, public_id: uuid() },
                    (error, uploadResult) => {
                        return resolve(uploadResult);
                    }
                )
                .end(byteArrayBuffer);
        });
        return instance;
    } catch (error) {
        console.log(error);
        return null;
    }
};

// TODO: delete from cloudinary function.

export { uploadOnCloudinary };
