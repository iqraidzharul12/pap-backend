import { Router } from "express";
import { ProgramController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", ProgramController.listAll);

// Get one data
router.get("/:id", ProgramController.getOneById);

//Create a new data
router.post("/", ProgramController.create);
router.post("/confirm", ProgramController.checkDoctorConfirmation);

//Edit one data
router.patch("/:id", ProgramController.edit);

//Delete one data
router.delete("/:id", ProgramController.delete);

export default router;
