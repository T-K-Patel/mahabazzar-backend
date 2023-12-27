import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { User } from "../models/user.model.js";
import ms from 'ms'
import CONFIG from "../app.config.js";
import jwt from "jsonwebtoken";
let UserController = {};

async function getUser(username) {
    return await User.aggregate([
        {
            $match: {
                username: username,
            },
        },
        {
            $lookup: {
                from: "orders",
                localField: "orderHistory",
                foreignField: "_id",
                pipeline: [
                    {
                        $unwind: "$products"
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "products._id",
                            foreignField: "_id",
                            let: { quantity: "$products.quantity", total: "$products.total", price: "$products.price" },
                            pipeline: [
                                {
                                    $addFields: { quantity: "$$quantity", total: "$$total", price: "$$price" }
                                }
                            ],
                            as: "products",
                        }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$_id",
                            totalPrice: { $first: "$totalPrice" },
                            products: {
                                $push: {
                                    _id: "$products._id",
                                    title: "$products.title",
                                    category: "$products.category",
                                    thumbnail: "$products.thumbnail",
                                    price: "$products.price",
                                    total: "$products.total",
                                    quantity: "$products.quantity"
                                }
                            },
                            discountedPrice: { $first: "$discountedPrice" },
                            status: { $first: "$status" },
                            expectedDelivery: { $first: "$expectedDelivery" },
                            createdAt: { $first: "$createdAt" }
                        }
                    },
                    {
                        $sort: {
                            createdAt: 1
                        }
                    }
                ],
                as: "orderHistory",
            },
        }
    ])
}


UserController.registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if ([username, email, password].some((value) => !value?.trim())) {
        console.log("Error encountered");
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) throw new ApiError(400, "User already exists");

    const avatarLocalPath = req.file?.avatar;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "Can't upload Avatar");

    const user = await User.create({
        username,
        email,
        password,
        avatar: avatar.url,
    });

    const createdUser = await User.findOne(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user.");
    }

    res.status(201).json(
        new ApiResponse(createdUser, "User created successfully")
    );
});


UserController.loginUser = asyncHandler(async (req, res) => {

    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) throw new ApiError(400, "Invalid username or password")
    const valid = await user.check_password(password)
    if (!valid) throw new ApiError(400, "Invalid username or password")

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    res.cookie("accessToken", accessToken, { expires: new Date(Date.now() + ms(CONFIG.ACCESS_TOKEN_EXPIRY)), httpOnly: true, secure: true })
    res.cookie("refreshToken", refreshToken, { expires: new Date(Date.now() + ms(CONFIG.REFRESH_TOKEN_EXPIRY)), httpOnly: true, secure: true })

    res.status(200).json(new ApiResponse({ accessToken, refreshToken, profile: (await getUser(user.username))[0] }, "Login Successful"))
})

UserController.refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if (!refreshToken) throw new ApiError(400, "Refresh Token required.")
    try {
        const decoded = jwt.verify(refreshToken, CONFIG.REFRESH_TOKEN_SECRET, {}, (err, decoded) => {
            if (!err) {
                // Token is valid
                if (decoded.exp * 1000 < Date.now()) throw new ApiError(401, "Authentication token has expired")
                return decoded
            }
        })


        const user = await User.findById(decoded._id)
        if (!user) throw new Error("Invalid Refresh Token")
        const accessToken = user.generateAccessToken()
        res.cookie("accessToken", accessToken, { expires: new Date(Date.now() + ms(CONFIG.ACCESS_TOKEN_EXPIRY)), httpOnly: true, secure: true })
        res.status(200).json(new ApiResponse({ accessToken }, "Token refreshed Successfully."))

    } catch (error) {
        res.clearCookie("refreshToken")
        if (error instanceof ApiError) throw error
        throw new ApiError(400, "Invalid refresh token")
    }
})


UserController.getUserData = asyncHandler(async (req, res) => {
    const user = req.user
    try {
        const userData = await getUser(req.user.username)
        if (!(userData && (userData instanceof Array) && userData.length > 0)) throw new ApiError(404, "User not found")

        res.status(200).json(new ApiResponse(userData[0], "UserData fetched successfully"))
    } catch (error) {
        console.log(error);
        throw new ApiError(500, error.message)
    }
})

export default UserController;
