import { Router } from "express";
import { ProgramController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", ProgramController.listAll);
router.get("/approved", ProgramController.listApprovedProgram);

// Get one data
router.get("/:id", ProgramController.getOneById);

//Create a new data
router.post("/", ProgramController.create);
router.post("/confirm", ProgramController.checkDoctorConfirmation);
router.post("/approve", ProgramController.approve);
router.post("/reject", ProgramController.reject);
router.post("/terminate", ProgramController.terminate);
router.post("/continue", ProgramController.continueProgram);
router.post("/updateDrugsTaken", ProgramController.updateDrugsTaken);

//Edit one data
router.patch("/:id", ProgramController.edit);

//Delete one data
router.delete("/:id", ProgramController.delete);

export default router;
