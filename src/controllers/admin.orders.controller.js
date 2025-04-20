import { StatusCodes } from "http-status-codes";
import { ApiError } from "../Errors/ApiError.js";
import { ORDER_STATUS_ENUM, Order } from "../models/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";

let AdminOrderController = {};

AdminOrderController.getRecentOrders = async (req, res) => {
    const orders = await Order.aggregate([
        {
            $sort: { createdAt: -1 },
        },
        {
            $match: {
                statusCode: {
                    $nin: [
                        ORDER_STATUS_ENUM.CANCELED,
                        ORDER_STATUS_ENUM.REJECTED_DECLINED,
                    ],
                },
            }
        },
        {
            $limit: 5,
        },
        {
            $lookup: {
                from: "orderitems",
                localField: "_id",
                foreignField: "order_id",
                pipeline: [
                    {
                        $project: {
                            item: 1,
                            price: 1,
                            quantity: 1,
                            rating: 1,
                        }
                    }
                ],
                as: "items",
            }
        },
        {
            $project: {
                user_id: 1,
                items: 1,
                statusCode: 1,
                totalPrice: 1,
                delivery: 1,
                createdAt: 1,
            }
        }
    ])
    res.status(200).json(new ApiResponse(orders, "Recent Orders"));
};

AdminOrderController.getIncompleteOrders = async (req, res) => {
    const orders = await Order.find({
        statusCode: {
            $nin: [
                ORDER_STATUS_ENUM.CANCELED,
                ORDER_STATUS_ENUM.REJECTED_DECLINED,
                ORDER_STATUS_ENUM.DELIVERED,
            ],
        },
    });
    res.status(200).json(new ApiResponse(orders, "Incomplete Orders"));
};

AdminOrderController.getDeliveredOrders = async (req, res) => {
    const orders = await Order.find({
        statusCode: ORDER_STATUS_ENUM.DELIVERED,
    }).sort("-createdAt");
    res.status(200).json(new ApiResponse(orders, "Delivered Orders"));
};

AdminOrderController.getCanceledOrders = async (req, res) => {
    const orders = await Order.find({
        statusCode: ORDER_STATUS_ENUM.CANCELED,
    }).sort("-createdAt");
    res.status(200).json(new ApiResponse(orders, "Canceled Orders"));
};

AdminOrderController.getAllOrders = async (req, res) => {
    const orders = await Order.find().sort("-createdAt");
    res.status(200).json(new ApiResponse(orders, "All Orders"));
};

AdminOrderController.processOrder = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;
    const possible_status = Object.values(ORDER_STATUS_ENUM);
    if (!possible_status.includes(status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status.");
    }
    let order;
    try {
        order = await Order.findById(order_id);
    } catch (error) { }

    if (!order) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Order with given order id not found"
        );
    }

    if (
        possible_status.indexOf(order_id.statusCode) + 1 !=
        possible_status.indexOf(status)
    ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status");
    }
    order.status = status;
    await order.save();
    res.status(200).json(
        new ApiResponse(order, "Order processed successfully")
    );
};

export default AdminOrderController;
