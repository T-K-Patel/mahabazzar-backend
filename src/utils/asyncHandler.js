const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            // TODO: Remove in Production
            console.log("\n", error.stack, "\n");
            res.status(error.code || error.status || 500).json({
                status: error.status,
                message: error.message,
                success: false,
                errors: error.errors,
            });
        });
    };
};

export default asyncHandler;
