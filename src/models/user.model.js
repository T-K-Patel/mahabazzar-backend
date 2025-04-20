import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV_CONFIG from "../app.config.js";

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
        mobile: {
            type: Number,
            integer: true,
            trim: true,
        },
        firstname: {
            type: String,
            trim: true,
            required: true,
        },
        lastname: {
            type: String,
            trim: true,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Prefer not to say"],
            default: "Prefer not to say",
        },
        password: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toObject: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.isActive;
                delete ret.isVerified;
                return ret;
            }
        },
        toJSON: {
            transform: function (doc, ret) {
                delete ret.isActive;
                delete ret.isVerified;
                delete ret.password;
                return ret;
            }
        }
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
            isAdmin: this.isAdmin,
        },
        ENV_CONFIG.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ENV_CONFIG.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        ENV_CONFIG.REFRESH_TOKEN_SECRET,
        {
            expiresIn: ENV_CONFIG.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);
export default User;
