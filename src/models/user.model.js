import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CONFIG from "../app.config.js";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            required: true,
        },
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female"],
        },
        address: {
            type: {
                address_line1: { type: String, required: true },
                address_line2: String,
                city: { type: String, required: true },
                coordinates: {
                    type: {
                        lat: { type: Number, required: true },
                        lng: { type: Number, required: true },
                    },
                },
                postalCode: { type: Number, required: true },
                state: { type: String, required: true },
            },
        },
        avatar: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        orderHistory: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Order",
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.check_password = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.update_password = async function (password) {
    this.password = password;
    await this.save();
    return this;
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        CONFIG.ACCESS_TOKEN_SECRET,
        {
            expiresIn: CONFIG.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        CONFIG.REFRESH_TOKEN_SECRET,
        {
            expiresIn: CONFIG.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);
export default User;
