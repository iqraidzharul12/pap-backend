import { Router } from "express";
import { ProgramEvidenceController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], ProgramEvidenceController.listAll);

// Get one data
router.get("/:id", [checkJwt], ProgramEvidenceController.getOneById);

//Create a new data
router.post("/", ProgramEvidenceController.create);

//Edit one data
router.patch("/:id", [checkJwt], ProgramEvidenceController.edit);

//Delete one data
router.delete("/:id", [checkJwt], ProgramEvidenceController.delete);

export default router;
