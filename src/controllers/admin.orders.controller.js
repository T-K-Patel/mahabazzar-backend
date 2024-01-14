import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

let AdminOrderController = {};

AdminOrderController.updateStatus = asyncHandler(async (req, res) => {
    const { order_id, status } = req.body;
    const user = req.user;
    let order = Order.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId(order_id) },
        },
        {
            $lookup: {
                from: "orderitems",
                pipeline: [],
                as: "products",
            },
        },
    ]);
    if (!order) throw new ApiError(404, "Order Not Found");
    order = order[0];

    res.status(200).json(new ApiResponse(order, "Order updated successfully"));
});

export default AdminOrderController;
