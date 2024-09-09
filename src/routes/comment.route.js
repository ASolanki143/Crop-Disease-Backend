import { Router } from "express";
import {
    addComment,
    deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/add-comment/:postId").post(addComment);
router.route("/delete-comment/:postId").delete(deleteComment);

export default router;
