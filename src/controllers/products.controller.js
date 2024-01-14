import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

let ProductController = {};

ProductController.addProduct = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        price,
        stock,
        brand,
        category,
        thumbnail,
        owner,
    } = req.body;

    if (
        [
            title,
            description,
            price,
            stock,
            brand,
            category,
            thumbnail,
            owner,
        ].some((value) => value == null)
    )
        throw new ApiError(400, "All fields are required.");

    const Owner = await User.findOne({ username: owner });

    const product = await Product.create({
        title,
        description,
        price,
        stock,
        brand,
        category,
        thumbnail,
        owner: Owner._id,
        // owner: req.user._id,
    });

    res.status(200).json(
        new ApiResponse(product, "Product Added Successfully.")
    );
});

export default ProductController;
