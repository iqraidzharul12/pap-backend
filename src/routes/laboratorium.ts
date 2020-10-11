import { Router } from "express";
import { LaboratoriumController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", LaboratoriumController.listAll);

// Get one data
router.get("/:id", LaboratoriumController.getOneById);

//Create a new data
router.post("/", LaboratoriumController.create);

//Edit one data
router.patch("/:id", LaboratoriumController.edit);

//Delete one data
router.delete("/:id", LaboratoriumController.delete);

export default router;
