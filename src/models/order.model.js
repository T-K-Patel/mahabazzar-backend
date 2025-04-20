import mongoose from "mongoose";

const ORDER_STATUS_ENUM = {
    PENDING: "P",
    ACCEPTED: "A",
    PROCESSING: "PR",
    SHIPPED: "S",
    OUT_FOR_DELIVERY: "OFD",
    DELIVERED: "D",
    CANCELED: "C",
    REJECTED_DECLINED: "R",
};

const ORDER_STATUS = {
    P: "Pending",
    A: "Accepted",
    PR: "Processing",
    S: "Shipped",
    OFD: "Out for Delivery",
    D: "Delivered",
    C: "Canceled",
    R: "Rejected/Declined",
};

const orderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        address: {
            landmark: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            pincode: {
                type: Number,
                required: true,
                match: /[0-9]{6}/,
            },
            phone: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                enum: ["HOME", "WORK"],
                default: "WORK",
            },
        },
        // LATER: Add payment details
        // payment: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Invoice",
        //     required: true,
        // },
        items: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "OrderItem",
            default: [],
        },
        statusCode: {
            type: String,
            enum: Object.keys(ORDER_STATUS),
            default: "P",
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        delivery: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.virtual("orderStatus").get(function () {
    return ORDER_STATUS[this.statusCode];
});

orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);

export { ORDER_STATUS_ENUM };
export default Order;
