import { ApiError } from "../Errors/ApiError.js";
import MetaData from "../models/metaData.model.js";

const authMiddleware = async (req, res, next) => {
    if (req.session?.userId) {
        next();
    } else {
        next(new ApiError(401, "Please login to continue."));
    }
};

export const adminAuthMiddleware = async (req, res, next) => {
    if (req.session?.userId && req.session?.isAdmin) {
        const admin = await MetaData.findOne({ key: "admin" });
        if (admin) {
            if (
                Array.isArray(admin.value) &&
                admin.value.includes(req.session.userId)
            ) {
                return next();
            }
        }
    }
    next(new ApiError(401, "You are not authorised to access this route."));
};

export default authMiddleware;
