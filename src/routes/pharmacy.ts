import { Router } from "express";
import { PharmacyController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], PharmacyController.listAll);

// Get one data
router.get("/:id", [checkJwt], PharmacyController.getOneById);

//Create a new data
router.post("/", PharmacyController.create);

//Edit one data
router.patch("/:id", [checkJwt], PharmacyController.edit);

//Delete one data
router.delete("/:id", [checkJwt], PharmacyController.delete);

export default router;
