import { Router } from "express";
import { VertificatorController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", VertificatorController.listAll);

// Get one data
router.get("/:id", VertificatorController.getOneById);

//Create a new data
router.post("/", VertificatorController.create);

//Edit one data
router.patch("/:id", VertificatorController.edit);

//Delete one data
router.delete("/:id", VertificatorController.delete);

export default router;
