import JWT from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import CONFIG from "../app.config.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken || req.body.accessToken;
        if (!accessToken) {
            throw new ApiError(
                401,
                "Authentication credentials were not provided"
            );
        }

        //TODO: validate auth token

        const decoded = JWT.verify(accessToken, CONFIG.ACCESS_TOKEN_SECRET, {}, (err, decoded) => {
            if (!err) {
                // Token is valid
                if (decoded.exp * 1000 < Date.now()) throw new ApiError(401, "Authentication token has expired")
                return decoded
            }
        })
        req.user = await User.findById(decoded._id)
        next()
    } catch (err) {
        res.clearCookie("accessToken")
        if (err instanceof ApiError) throw err;
        throw new ApiError(401, "Invalid Authentication Token");
    }
});
export default authMiddleware;
