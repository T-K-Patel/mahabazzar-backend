import mongoose from "mongoose";

const RatingsSchema = mongoose.Schema({
    1: { type: Number, integer: true },
    2: { type: Number, integer: true },
    3: { type: Number, integer: true },
    4: { type: Number, integer: true },
    5: { type: Number, integer: true },
});

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
        },
        rating: {
            type: RatingsSchema,
            default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        stock: {
            type: Number,
            required: true,
            integer: true,
        },
        brand: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
            },
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
