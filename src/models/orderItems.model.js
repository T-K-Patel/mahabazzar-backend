import mongoose from "mongoose";

const OrderItemSchema = mongoose.Schema(
    {
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        cost: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            integer: true,
        },
        // LATER : add inidividual status in delivering seperately.
        // status: {
        //     type: String,
        //     enum: Object.keys(ORDER_STATUS),
        //     default: "Pending",
        // },
        rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
        },
    },
    {
        timestamps: true,
    }
);

const OrderItems = mongoose.model("OrderItem", OrderItemSchema);
export default OrderItems;
