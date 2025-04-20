import { ApiError } from "../Errors/ApiError.js";

export default function ErrorHandler(error, req, res, next) {
    console.log(error);
    if (error instanceof ApiError) {
        res.status(error.status).json(error);
    } else {
        res.status(500).json(new ApiError());
    }
}
