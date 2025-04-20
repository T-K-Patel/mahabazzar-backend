import { StatusCodes } from "http-status-codes";
import { ApiError } from "../Errors/ApiError.js";
export async function captchaMiddleware(req, res, next) {
    if (!req.body.captcha) return next(new ApiError(400, "Captcha is required"));
    let error = "Invalid captcha";
    if (req.session.captcha && req.session.captcha.text == req.body.captcha) {
        const captchaTimestamp = req.session.captcha.timestamp;
        const currentTime = Date.now();
        const diff = currentTime - captchaTimestamp;
        if (diff > 300000) {
            error = "Captcha expired";
        } else {
            req.session.captcha = null;
            return next();
        }
    }
    req.session.captcha = null;
    next(new ApiError(StatusCodes.UNAUTHORIZED, error));
}
