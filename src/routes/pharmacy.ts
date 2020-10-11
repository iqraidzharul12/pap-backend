import { Router } from "express";
import { PharmacyController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", PharmacyController.listAll);

// Get one data
router.get("/:id", PharmacyController.getOneById);

//Create a new data
router.post("/", PharmacyController.create);

//Edit one data
router.patch("/:id", PharmacyController.edit);

//Delete one data
router.delete("/:id", PharmacyController.delete);

export default router;
