import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!postId || !isValidObjectId(postId)) {
        throw new ApiError(400, "Post id not found");
    }

    const comment = await Comment.create({
        postId,
        content,
        userId: req.user?._id,
    });

    if (!comment) {
        throw new ApiError(400, "Failed to create comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment created successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment delete successfully"));
});

export { addComment, deleteComment };
