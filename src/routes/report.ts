import { Router } from "express";
import { ReportController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/program", ReportController.programMonthly);
router.get("/program/mobile", ReportController.programMonthlyMobile);
router.get("/program/status", ReportController.programStatusMonthly);
router.get("/program/terminate", ReportController.terminatedByReason);
router.get("/patient/city", ReportController.patientByCity);
router.get("/doctor/city", ReportController.doctorByCity);

export default router;
