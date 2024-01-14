import Order from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

let OrderController = {};
OrderController.addOrder = asyncHandler(async (req, res) => {
    const { user_id, products, totalPrice } = req.body;
    if ([user_id, products, totalPrice].some((val) => val == null)) {
        throw new ApiError(400, "All fields are required.");
    }
    const order = await Order.create({
        user_id,
        products,
        totalPrice,
    });
    res.status(200).json(new ApiResponse(order, "Order created successfully"));
});

export default OrderController;
