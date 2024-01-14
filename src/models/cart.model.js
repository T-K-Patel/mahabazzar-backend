import mongoose from "mongoose";
// TODO: review this model if there is requirement of cart. or just cartitem can do the work.
const CartItemSchema = mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            integer: true,
        },
    },
    {
        timestamps: true,
    }
);

const CartItem = mongoose.model("CartItem", CartItemSchema);

const CartSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: {
            type: [CartItemSchema],
            validate: {
                validator: function (products) {
                    return products.length > 0;
                },
                message: "There must be at least one item in the order.",
            },
            required: true,
        },
        // TODO: add Cart flags if needed.
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model("Cart", CartSchema);

Cart.CartItem = CartItem;

export default Cart;
