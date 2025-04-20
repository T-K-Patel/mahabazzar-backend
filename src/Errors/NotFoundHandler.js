import { ApiError } from "./ApiError.js";

export default function NotFoundHandler(req, res, next) {
    throw new ApiError(404, "Requested route Not Found.");
}
