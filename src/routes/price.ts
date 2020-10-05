import { Router } from "express";
import { PriceController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], PriceController.listAll);

// Get one data
router.get("/:id", [checkJwt], PriceController.getOneById);

//Create a new data
router.post("/", PriceController.create);

//Edit one data
router.patch("/:id", [checkJwt], PriceController.edit);

//Delete one data
router.delete("/:id", [checkJwt], PriceController.delete);

export default router;
