import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllLikedPost, toggleLike } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle-like/:postId").post(toggleLike);
router.route("/all-like-post").get(getAllLikedPost);

export default router;
