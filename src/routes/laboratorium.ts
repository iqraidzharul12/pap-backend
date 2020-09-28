import { Router } from "express";
import { LaboratoriumController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], LaboratoriumController.listAll);

// Get one data
router.get("/:id", [checkJwt], LaboratoriumController.getOneById);

//Create a new data
router.post("/", [checkJwt], LaboratoriumController.create);

//Edit one data
router.patch("/:id", [checkJwt], LaboratoriumController.edit);

//Delete one data
router.delete("/:id", [checkJwt], LaboratoriumController.delete);

export default router;
