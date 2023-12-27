import mongoose from "mongoose";

const ProductsSchema = mongoose.Schema({
    _id: {
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
});

const OrderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: {
            type: [ProductsSchema],
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
                "Received",
                "Processing",
                "In Transit",
                "Out for Delivery",
                "Delivered",
            ],
            default: "Received",
        },
        expectedDelivery: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export const OrderModel = mongoose.model("Order", OrderSchema);
