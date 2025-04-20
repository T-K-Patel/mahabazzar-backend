import { User } from "../models/index.js";
import { StatusCodes } from "http-status-codes";
import uploadFileToFirebase from "../utils/Firebase.js";
import { ApiError } from "../Errors/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

let UserController = {};

UserController.updateAvatar = async (req, res) => {
    const user = await User.findById(req.jwt.payload._id);
    if (!user) throw new ApiError(404, "User not found");

    const avatarFileBuffer = req.file?.buffer;
    const fileExtension = req.file?.originalname?.split(".").pop();
    const mimeType = req.file?.mimetype;

    if (!avatarFileBuffer) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadFileToFirebase(
        avatarFileBuffer,
        "users/avatar",
        fileExtension ?? null,
        mimeType
    );
    if (!avatar) throw new ApiError(400, "Can't upload Avatar");

    user.avatar = avatar;
    await user.save();

    res.status(StatusCodes.OK).json(
        new ApiResponse({ avatar }, "Avatar updated successfully")
    );
};

UserController.getUserData = async (req, res) => {
    const userId = req.session.userId;

    const user = await User.findById(userId).select(
        "-password -__v -isVerified -isActive"
    );
    if (!user) throw new ApiError(404, "User not found");
    res.status(StatusCodes.OK).json(
        new ApiResponse(user, "UserData fetched successfully")
    );
};

UserController.resetPassword = async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.jwt.payload._id);
    if (!user) throw new ApiError(404, "User not found");

    await user.update_password(password);
    await user.save();
    res.status(StatusCodes.OK).json(
        new ApiResponse(null, "Password updated successfully")
    );
};
export default UserController;
