import mongoose from "mongoose";

// TODO: review this model if there is requirement of cart. or just cartitem can do the work.
const CartItemSchema = mongoose.Schema(
    {
        cart_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },
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
        items: {
            type: [CartItemSchema],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model("Cart", CartSchema);

export { CartItem };
export default Cart;
