import { Router } from "express";
import { CityController } from "../controllers";

const router = Router();

//Get all data
router.get("/", CityController.listAll);

export default router;
