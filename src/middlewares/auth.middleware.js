import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import CONFIG from "../app.config.js";

// const authMiddleware = asyncHandler( async ( req, res, next ) => {
//     try {
//         const accessToken = req.cookies.accessToken || req.body.accessToken;
//         if ( !accessToken ) {
//             throw new ApiError(
//                 401,
//                 "Authentication credentials were not provided"
//             );
//         }
//         const decoded = JWT.verify(
//             accessToken,
//             CONFIG.ACCESS_TOKEN_SECRET,
//             {},
//             ( err, decoded ) => {
//                 if ( !err ) {
//                     if ( decoded.exp * 1000 < Date.now() )
//                         throw new ApiError(
//                             401,
//                             "Authentication token has expired"
//                         );
//                     return decoded;
//                 }
//             }
//         );
//         req.user = await User.findById( decoded._id );
//         next();
//     } catch ( err ) {
//         res.clearCookie( "accessToken" );
//         if ( err instanceof ApiError ) throw err;
//         throw new ApiError( 401, "Invalid Authentication Token" );
//     }
// } );
// export default authMiddleware;

const authMiddleware = asyncHandler(async (req, res, next) => {
    const authorization =
        req.cookies.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");
    if (!authorization) {
        throw new ApiError(401, "No Authorization Header");
    } else
        try {
            const token = authorization;
            if (!token) {
                throw new ApiError(401, "Invalid Token Format");
            }
            const decode = jwt.verify(token, CONFIG.ACCESS_TOKEN_SECRET);
            req.user = await User.findById(decode._id);
            next();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new ApiError(401, "Session Expired", error.message);
            }
            if (
                error instanceof jwt.JsonWebTokenError ||
                error instanceof TokenError
            ) {
                throw new ApiError(401, "Invalid Token", error.message);
            }
            throw new ApiError(500, "Internal server Error", error.message);
        }
});

export default authMiddleware;
