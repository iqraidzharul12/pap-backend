import { Router } from "express";
import { ProgramTypeController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], ProgramTypeController.listAll);

// Get one data
router.get("/:id", [checkJwt], ProgramTypeController.getOneById);

//Create a new data
router.post("/", ProgramTypeController.create);

//Edit one data
router.patch("/:id", [checkJwt], ProgramTypeController.edit);

//Delete one data
router.delete("/:id", [checkJwt], ProgramTypeController.delete);

export default router;
