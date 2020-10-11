import { Router } from "express";
import { FileUploadController } from "../controllers";
import { checkJwt, uploadId, uploadSelfie, uploadPrescription, uploadLabResult } from "../middlewares";

const router = Router();

//Upload ID and Selfie
router.post("/id", [uploadId], FileUploadController.upload);
router.post("/selfie", [uploadSelfie], FileUploadController.upload);
router.post("/prescription", [checkJwt, uploadPrescription], FileUploadController.upload);
router.post("/lab-result", [checkJwt, uploadLabResult], FileUploadController.upload);

export default router;
