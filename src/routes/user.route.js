import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    changeCurrentPassword,
    getAllPost,
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

// secure routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/all-post").get(verifyJWT, getAllPost);

router
    .route("/avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
export default router;
