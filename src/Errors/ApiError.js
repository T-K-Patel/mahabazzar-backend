class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong, try again later.",
        errors = undefined
    ) {
        super();
        this.success = false;
        this.status = statusCode;
        this.message = message;
        errors && (this.errors = errors);
        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError };
