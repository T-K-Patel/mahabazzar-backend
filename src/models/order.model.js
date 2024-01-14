import mongoose from "mongoose";

const OrderItemSchema = mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            integer: true,
        },
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Order Received",
                "Processing",
                "In Transit",
                "Out for Delivery",
                "Delivered",
            ],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

export const OrderItems = mongoose.model("OrderItem", OrderItemSchema);

const OrderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "OrderItem",
            validate: {
                validator: function (products) {
                    return products.length > 0;
                },
                message: "There must be at least one item in the order.",
            },
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        discountedPrice: {
            type: Number,
        },
        status: {
            type: String,
            enum: [
                "Order Received",
                "Processing",
                "In Transit",
                "Out for Delivery",
                "Delivered",
                "Canceled",
            ],
            default: "Order Received",
        },
        tax: { type: String },
        expectedDelivery: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;
