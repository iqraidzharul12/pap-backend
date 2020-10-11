import { Router } from "express";
import { ProgramEvidenceController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", ProgramEvidenceController.listAll);

// Get one data
router.get("/:id", ProgramEvidenceController.getOneById);

//Create a new data
router.post("/", ProgramEvidenceController.create);

//Edit one data
router.patch("/:id", ProgramEvidenceController.edit);

//Delete one data
router.delete("/:id", ProgramEvidenceController.delete);

export default router;
