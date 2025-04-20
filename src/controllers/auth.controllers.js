import { User } from "../models/index.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../Errors/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { z } from "zod";

const AuthController = {};

const registerSchema = z.object({
    username: z
        .string({ message: "Username is required" })
        .trim()
        .toLowerCase()
        .min(5, { message: "Username must be at least 5 characters long" })
        .max(15, { message: "Username must be at most 15 characters long" }),
    email: z
        .string({ message: "Email is required" })
        .trim()
        .email({ message: "Invalid email address" }),
    mobile: z
        .string()
        .refine((value) => !isNaN(Number(value)), {
            message: "Mobile number must be a valid number",
        })
        .refine((value) => value.length == 10, {
            message: "Mobile number must be 10 digits",
        }),
    gender: z
        .enum(["Male", "Female", "Prefer not to say"])
        .default("Prefer not to say"),
    password: z
        .string({ message: "Password is required" })
        .trim()
        .min(6, { message: "Password must be at least 6 characters long" }),
    firstname: z
        .string({ message: "Firstname is required" })
        .trim()
        .min(2, { message: "Firstname must be at least 3 characters long" }),
    lastname: z
        .string({ message: "Lastname is required" })
        .trim()
        .min(2, { message: "Lastname must be at least 3 characters long" }),
});

function formatErrors(errors) {
    const formattedErrors = {};
    for (const [key, value] of Object.entries(errors)) {
        if (Array.isArray(value._errors) && value._errors.length > 0) {
            formattedErrors[key] = value._errors[0]; // Assuming only one error per field
        }
    }
    return formattedErrors;
}

AuthController.registerUser = async (req, res) => {
    const { success, data, error } = registerSchema.safeParse(req.body);

    if (!success) {
        throw new ApiError(400, "Invalid fields", formatErrors(error.format()));
    }

    const existingUser = await User.findOne({
        $or: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser) throw new ApiError(400, "User already exists");

    const user = await User.create(data);

    // LATER : Send verification email

    const createdUser = await User.findOne(user._id).select(
        "-password -__v -isVerified -isActive"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while signing up.");
    }

    res.status(StatusCodes.CREATED).json(
        new ApiResponse(createdUser, "User created successfully")
    );
};

AuthController.loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        throw new ApiError(400, "Username and password are required to login");
    const user = await User.findOne({ username });
    const valid = await user?.check_password(password);
    if (!valid) throw new ApiError(400, "Invalid username or password");

    req.session.userId = user._id;

    res.status(StatusCodes.OK).json(
        new ApiResponse({ user }, "Login Successful")
    );
};

export default AuthController;
