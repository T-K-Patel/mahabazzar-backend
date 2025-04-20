import { Product } from "../models/index.js";
import { ApiError } from "../Errors/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

let ProductController = {};

ProductController.getAllProducts = async (req, res) => {
    const products = await Product.aggregate([
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                discountPercentage: 1,
                price: 1,
                discountedPrice: {
                    $multiply: [
                        "$price",
                        {
                            $divide: [
                                {
                                    $subtract: [100, "$discountPercentage"],
                                },
                                100,
                            ],
                        },
                    ],
                },
                stock: {
                    $cond: {
                        if: { $lte: ["$stock", 5] },
                        then: "$stock",
                        else: "$$REMOVE",
                    },
                },
                category: 1,
                thumbnail: 1,
                image: 1,
            },
        },
    ]);
    res.status(StatusCodes.OK).json(
        new ApiResponse(products, "Fetched all products successfully.")
    );
};

export default ProductController;
