import { Router } from "express";
import { ProgramTypeController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", ProgramTypeController.listAll);

// Get one data
router.get("/:id", ProgramTypeController.getOneById);

//Create a new data
router.post("/", ProgramTypeController.create);

//Edit one data
router.patch("/:id", ProgramTypeController.edit);

//Delete one data
router.delete("/:id", ProgramTypeController.delete);

export default router;
