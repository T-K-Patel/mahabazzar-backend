import { StatusCodes } from "http-status-codes";
import { ORDER_STATUS_ENUM, Order, OrderItems, Product } from "../models/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";

let AdminStatsController = {};

AdminStatsController.getAccountsStats = async (req, res) => {
    const totalProducts = await Product.countDocuments();
    const totalOrders = {};
    for (let i in Object.values(ORDER_STATUS_ENUM).length) {
        totalOrders[i] = 0;
    }
    (await Order.aggregate([
        {
            $group: {
                _id: "$statusCode",
                totalOrders: {
                    $sum: 1,
                },
            },
        },
    ])).forEach(orderCategory => {
        totalOrders[orderCategory._id] = orderCategory.totalOrders;
    });
    const salesAccounts = await OrderItems.aggregate([
        {
            $lookup: {
                from: "orders",
                localField: "order_id",
                foreignField: "_id",
                as: "order",
            },
        },
        {
            $unwind: "$order",
        },
        {
            $match: {
                "order.statusCode": ORDER_STATUS_ENUM.DELIVERED,
            },
        },
        {
            $group: {
                _id: null,
                totalQuantity: {
                    $sum: "$quantity",
                },
                totalSales: {
                    $sum: { $multiply: ["$price", "$quantity"] },
                },
                totalCost: {
                    $sum: { $multiply: ["$cost", "$quantity"] },
                },
            },
        },
        {
            $set: {
                totalProfit: { $subtract: ["$totalSales", "$totalCost"] },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    const rating = await OrderItems.aggregate([
        {
            $match: {
                rating: { $ne: null },
            },
        },
        {
            $group: {
                _id: null,
                ratedBy: {
                    $sum: 1,
                },
                avgRating: {
                    $avg: "$rating",
                },
            },
        },
        {
            $project: {
                _id: 0,
            },
        }
    ]);

    res.status(StatusCodes.OK).json(
        new ApiResponse(
            {
                totalProducts,
                totalOrders,
                salesAccounts:
                    salesAccounts.length > 0
                        ? salesAccounts[0]
                        : {
                            totalQuantity: 0,
                            totalSales: 0,
                            totalCost: 0,
                            totalProfit: 0,
                        },
                rating:
                    rating.length > 0
                        ? rating[0]
                        : { ratedBy: 0, avgRating: 0 },
            },
            "Dashboard Stats"
        )
    );
};

export default AdminStatsController;
