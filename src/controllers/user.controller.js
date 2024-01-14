import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { User } from "../models/index.js";
// import User from "../models/user.model.js";
import ms from "ms";
import CONFIG from "../app.config.js";
import jwt from "jsonwebtoken";
import uploadFileToFirebase from "../utils/Firebase.js";
let UserController = {};

async function getUser(username) {
    const user = await User.aggregate([
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
                        $unwind: "$products",
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "products._id",
                            foreignField: "_id",
                            let: {
                                quantity: "$products.quantity",
                                total: "$products.total",
                                price: "$products.price",
                            },
                            pipeline: [
                                {
                                    $addFields: {
                                        quantity: "$$quantity",
                                        total: "$$total",
                                        price: "$$price",
                                    },
                                },
                            ],
                            as: "products",
                        },
                    },
                    {
                        $unwind: "$products",
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
                                    quantity: "$products.quantity",
                                },
                            },
                            discountedPrice: { $first: "$discountedPrice" },
                            status: { $first: "$status" },
                            expectedDelivery: { $first: "$expectedDelivery" },
                            createdAt: { $first: "$createdAt" },
                        },
                    },
                    {
                        $sort: {
                            createdAt: 1,
                        },
                    },
                ],
                as: "orderHistory",
            },
        },
        {
            $unset: ["password", "__v", "isVerified", "isActive", "isAdmin"],
        },
    ]);
    if (user && user instanceof Array && user.length > 0) return user[0];
    return null;
}

UserController.registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, firstname, lastname } = req.body;

    if (
        [username, email, password, firstname, lastname].some(
            (value) => !value?.trim()
        )
    ) {
        console.log("Error encountered");
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) throw new ApiError(400, "User already exists");

    const avatarFileBuffer = req.file?.buffer;
    const fileExtension = req.file?.originalname?.split('.').pop();
    const mimeType = req.file?.mimetype;

    if (!avatarFileBuffer) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatarUrl = await uploadFileToFirebase(avatarFileBuffer, "users/avatar", fileExtension ?? null, mimeType);
    if (!avatarUrl) throw new ApiError(400, "Can't upload Avatar");

    const user = await User.create({
        username,
        email,
        password,
        firstname,
        lastname,
        avatar: avatarUrl,
    });

    const createdUser = await User.findOne(user._id).select(
        "-password -__v -isVerified -isActive -isAdmin"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user.");
    }

    res.status(201).json(
        new ApiResponse(createdUser, "User created successfully")
    );
});

// TODO: change validation.

UserController.resetPassword = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) throw new ApiError(404, "User not found");
    // await user.update_password(password);
    // await user.save();
    res.status(200).json(
        new ApiResponse(null, "Password updated successfully")
    );
});

UserController.loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        throw new ApiError(
            400,
            "Both username and password are required to login"
        );

    const user = await User.findOne({ username });
    const valid = await user?.check_password(password);
    if (!valid) throw new ApiError(400, "Invalid username or password");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.cookie("accessToken", accessToken, {
        expires: new Date(Date.now() + ms(CONFIG.ACCESS_TOKEN_EXPIRY)),
        httpOnly: true,
        secure: true,
    });
    res.cookie("refreshToken", refreshToken, {
        expires: new Date(Date.now() + ms(CONFIG.REFRESH_TOKEN_EXPIRY)),
        httpOnly: true,
        secure: true,
    });

    res.status(200).json(
        new ApiResponse(
            {
                accessToken,
                refreshToken,
                profile: await getUser(user.username),
            },
            "Login Successful"
        )
    );
});

UserController.refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) throw new ApiError(400, "Refresh Token required.");
    try {
        const decoded = jwt.verify(
            refreshToken,
            CONFIG.REFRESH_TOKEN_SECRET,
            {},
            (err, decoded) => {
                if (!err) {
                    // Token is valid
                    if (decoded.exp * 1000 < Date.now())
                        throw new ApiError(
                            401,
                            "Authentication token has expired"
                        );
                    return decoded;
                }
            }
        );

        const user = await User.findById(decoded._id);
        if (!user) throw new Error("Invalid Refresh Token");
        const accessToken = user.generateAccessToken();
        res.cookie("accessToken", accessToken, {
            expires: new Date(Date.now() + ms(CONFIG.ACCESS_TOKEN_EXPIRY)),
            httpOnly: true,
            secure: true,
        });
        res.status(200).json(
            new ApiResponse({ accessToken }, "Token refreshed Successfully.")
        );
    } catch (error) {
        res.clearCookie("refreshToken");
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, "Invalid refresh token");
    }
});

UserController.getUserData = asyncHandler(async (req, res) => {
    const user = req.user;
    try {
        const userData = await getUser(req.user.username);
        if (!userData) throw new ApiError(404, "User not found");

        res.status(200).json(
            new ApiResponse(userData, "UserData fetched successfully")
        );
    } catch (error) {
        console.log(error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message);
    }
});

export default UserController;
