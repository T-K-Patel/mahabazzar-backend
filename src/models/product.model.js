import mongoose from "mongoose";

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
        cost: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        stock: {
            type: Number,
            required: true,
            integer: true,
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
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
