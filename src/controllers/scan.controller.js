import { Scan } from "../models/scan.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addScanDisease = asyncHandler(async (req, res) => {
    const { response, question } = req.body;

    if (!response || !question) {
        throw new ApiError(400, "Response and Question are required");
    }

    const localImagePath = req.file?.path;

    if (!localImagePath) {
        throw new ApiError(400, "Image is required");
    }

    const image = await uploadOnCloudinary(localImagePath);

    if (!image) {
        throw new ApiError(400, "Image upload failed");
    }

    const scan = await Scan.create({
        response,
        question,
        image: image.url,
        userId: req.user?._id,
    });

    if (!scan) {
        throw new ApiError(500, "Scan creation failed");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, scan, "Scan Disease created successfully"));
});

const getUserAllScanDiseases = asyncHandler(async (req, res) => {
    const scanDiseases = await Scan.find({ userId: req.user?._id });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                scanDiseases,
                "All Diseases fetched successfully"
            )
        );
});

const deleteScanDisease = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Scan disease id is required");
    }

    const scanDisease = await Scan.findByIdAndDelete(id);

    if (!scanDisease) {
        throw new ApiError(400, "Failed to delete scan disease");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Scan disease deleted successfully"));
});

export { addScanDisease, getUserAllScanDiseases, deleteScanDisease };
