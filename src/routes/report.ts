import { Router } from "express";
import { ReportController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/program", ReportController.programMonthly);
router.get("/program/mobile", ReportController.programMonthlyMobile);

export default router;
