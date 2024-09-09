import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addScanDisease,
    deleteScanDisease,
    getUserAllScanDiseases,
} from "../controllers/scan.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/add").post(upload.single("image"), addScanDisease);
router.route("/delete/:id").delete(deleteScanDisease);
router.route("/all-disease").get(getUserAllScanDiseases);

export default router;
