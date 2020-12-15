import { Router } from "express";
import { NewsController } from "../controllers";

const router = Router();

//Get all data
router.get("/", NewsController.listAll);

export default router;
