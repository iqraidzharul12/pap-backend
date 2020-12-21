import { Router } from "express";
import { DashboardController } from "../controllers";

const router = Router();

//Get all data
router.get("/", DashboardController.dashboardCard);

export default router;
