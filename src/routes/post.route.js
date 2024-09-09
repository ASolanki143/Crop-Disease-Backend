import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addPost,
    deletePost,
    editPostDetail,
    editPostImage,
    getAllPost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/get-all-post").get(getAllPost);
router.route("/add-post").post(addPost);
router.route("/image/:id").patch(upload.single("image"), editPostImage);
router.route("/post-details/:id").patch(editPostDetail);
router.route("/delete/:id").delete(deletePost);

export default router
