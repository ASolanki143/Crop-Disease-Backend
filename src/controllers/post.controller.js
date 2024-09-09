import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCurrentUserAllPost = asyncHandler(async (req, res) => {
    // const posts = await Post.find(
    //     {
    //         userID : req.user._id
    //     }
    // )

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

const getAllPost = asyncHandler(async (req, res) => {
    const posts = await Post.aggregate(
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
        }
    );

    if (!posts) {
        throw new ApiError(500, "Failed to retrieved posts");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                posts,
                "All Post for community retrieved successfully"
            )
        );
});

const addPost = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!(title || description)) {
        throw new ApiError(400, "Title and Description is required");
    }
    const image = req.file?.path;

    if (!image) {
        throw new ApiError(400, "Image is required");
    }

    const post = await Post.create({
        title,
        description,
        image: image.url,
        userID: req.user._id,
    });

    if (!post) {
        throw new ApiError(500, "Failed to create post");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post create successfully"));
});

const editPostImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const image = req.file?.path;

    if (!image) {
        throw new ApiError(400, "Image is required");
    }

    const post = await Post.findOneAndUpdate(
        id,
        {
            $set: {
                image: image.url,
            },
        },
        { new: true }
    );

    if (!post) {
        throw new ApiError(500, "Failed to change post image");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post image updated successfully"));
});

const editPostDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const post = await Post.findByIdAndUpdate(
        id,
        {
            $set: {
                title,
                description,
            },
        },
        { new: true }
    );

    if (!post) {
        throw new ApiError(500, "Failed to change post details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post details updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post deleted successfully"));
});

export {
    getCurrentUserAllPost,
    getAllPost,
    addPost,
    editPostImage,
    editPostDetail,
    deletePost
};
