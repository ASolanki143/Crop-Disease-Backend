import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const options = {
    httpOnly: true,
    secure: true,
};

const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, description } = req.body;

    if (
        [username, email, password, description].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All Fields Are Required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(
            400,
            "User with this email or username already exists"
        );
    }

    let avatarLocalPath;

    if (req.file) {
        avatarLocalPath = req.file.path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const user = await User.create({
        username,
        email,
        password,
        avatar: avatar?.url || "",
        description,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdUser, "User Register Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new ApiError(400, "Email or Username is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(401, "Invalid username or email");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const userID = req.user._id;
    console.log(userID);
    const user = await User.findByIdAndUpdate(
        userID,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        description,
        firstName,
        lastName,
        dateOfBirth,
        city,
        state,
        village,
        gender,
        occupation,
    } = req.body;

    if (
        [
            username,
            email,
            description,
            firstName,
            lastName,
            dateOfBirth,
            city,
            state,
            village,
            gender,
            occupation,
        ].some((item) => item?.trim() === "")
    ) {
        throw new ApiError(400, "Please fill all fields");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                username,
                email,
                description,
                firstName,
                lastName,
                dateOfBirth,
                city,
                state,
                village,
                gender,
                occupation,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account Details Updated Successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload an image");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, "Failed to upload image");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User Details Retrieved Successfully"
            )
        );
});

const getAllPost = asyncHandler(async (req, res) => {
    const posts = await Post.aggregate([
        {
            $match: {
                userID: req.user._id,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "userID",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                user: { $arrayElemAt: ["$user", 0] }, // Extract the first user document
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "postID",
                as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                username: "$user.username",
                avatar: "$user.avatar",
            },
        },
        {
            $project: {
                likes: 0,
                user: 0,
            },
        },
    ]);

    if (!posts) {
        throw new ApiError(500, "Failed to retrieved posts");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "All Post retrieved"));
});

export {
    changeCurrentPassword,
    loginUser,
    logoutUser,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    getCurrentUser,
    getAllPost,
};
