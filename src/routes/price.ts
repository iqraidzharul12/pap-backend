import { Router } from "express";
import { PriceController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", PriceController.listAll);

// Get one data
router.get("/:id", PriceController.getOneById);

//Create a new data
router.post("/", PriceController.create);

//Edit one data
router.patch("/:id", PriceController.edit);

//Delete one data
router.delete("/:id", PriceController.delete);

export default router;
