import { Router } from "express";
import { ProgramController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], ProgramController.listAll);

// Get one data
router.get("/:id", [checkJwt], ProgramController.getOneById);

//Create a new data
router.post("/", ProgramController.create);

//Edit one data
router.patch("/:id", [checkJwt], ProgramController.edit);

//Delete one data
router.delete("/:id", [checkJwt], ProgramController.delete);

export default router;
