import { ApiError } from "../Errors/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Product, OrderItems, Order } from "../models/index.js";
import { StatusCodes } from "http-status-codes";

let OrderController = {};
OrderController.addOrder = async (req, res) => {
    const {
        products,
        address: { landmark, city, state, country, pincode, phone, type },
    } = req.body;
    if (!products || !Array.isArray(products) || products.length == 0) {
        throw new ApiError(400, "Products are required.");
    }
    if (products.length > 5) {
        throw new ApiError(400, "Maximum 5 products are allowed in one order.");
    }
    if (
        [landmark, city, state, country, pincode, phone, type].some(
            (value) => !value?.trim()
        )
    ) {
        throw new ApiError(400, "All fields in address are required.");
    }
    if (/[0-9]{6}/.test(pincode) == false) {
        throw new ApiError(400, "Invalid Pincode.");
    }
    if (type != undefined && type != "HOME" && type != "WORK") {
        throw new ApiError(400, "Invalid Address Type.");
    }

    let items = [];
    let totalPrice = 0;
    for (let { id, quantity } of products) {
        if (quantity <= 0 || !Number.isInteger(quantity))
            throw new ApiError(400, "Invalid Quantity in one of the product.");
        const item = await Product.findById(id);

        if (item.stock < quantity)
            throw new ApiError(400, "One or more product is out of stock.");

        if (!item) throw new ApiError(404, "One or more product id is invalid");
        items.push({
            product: id,
            quantity,
            price: item.price,
            total: item.price * quantity,
        });
        totalPrice += item.price * quantity;
    }
    const order = await Order.create({
        user_id: new mongoose.Types.ObjectId(req.jwt.payload._id),
        address: {
            landmark,
            city,
            state,
            country,
            pincode,
            phone,
            type: type || "WORK",
        },
        totalPrice,
    });
    let errors = [];
    for (let item of items) {
        const orderedItem = await OrderItems.create({
            ...item,
            order: new mongoose.Types.ObjectId(order._id),
        });
        if (!orderedItem) {
            errors.push(item);
        } else {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }
    }
    if (errors.length > 0) {
        res.status(StatusCodes.PARTIAL_CONTENT).json(
            new ApiResponse(order, "Partial Order placed.")
        );
    } else {
        res.status(StatusCodes.OK).json(
            new ApiResponse(order, "Order placed successfully")
        );
    }
};

// TODO: Implement getOrderHistory
OrderController.getOrderDetails = async (req, res) => {
    const userId = req.jwt.payload._id;
    const { order_id } = req.params;

    const orderDetails = await Order.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(order_id),
                user_id: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "orderitems",
                localField: "_id",
                foreignField: "order",
                pipeline: [
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                ],
                as: "items",
            },
        },
    ]);
    if (orderDetails == []) throw new ApiError(404, "Invalid order id.");
    res.status(StatusCodes.OK).json(
        new ApiResponse(orderDetails[0], "Order fetched successfully.")
    );
};

export default OrderController;
