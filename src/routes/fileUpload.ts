import { Router } from "express";
import { FileUploadController } from "../controllers";
import { checkJwt, upload } from "../middlewares";

const router = Router();

//Upload ID and Selfie
router.post("/", [checkJwt, upload], FileUploadController.upload);

export default router;
