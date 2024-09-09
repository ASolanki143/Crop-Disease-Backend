import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getAllLikedPost = asyncHandler(async (req, res) => {
    const posts = await Like.aggregate([
        {
            $match: {
                userId: req.user._id,
            },
        },
        {
            $lookup: {
                from: "posts",
                localField: "postId",
                foreignField: "_id",
                as: "posts",
            },
        },
        {
            $unwind: "$posts",
        },
        {
            $project: {
                posts: 1,
                _id: 0,
            },
        },
    ]);

    if (!posts) {
        throw new ApiError("Failed to find liked post");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, posts, "Liked posts retrieved successfully")
        );
});

const toggleLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid PostID");
    }

    const alreadyLiked = await Like.findOne({
        userId: req.user._id,
        postId,
    });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, false, "Post Disliked Successfully"));
    }

    const like = await Like.create({
        userId: req.user?._id,
        postId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, true, "Post Liked Successfully"));
});

export { getAllLikedPost, toggleLike };
