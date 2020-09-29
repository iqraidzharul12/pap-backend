import { Router } from "express";
import { TestLabEvidenceController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], TestLabEvidenceController.listAll);

// Get one data
router.get("/:id", [checkJwt], TestLabEvidenceController.getOneById);

//Create a new data
router.post("/", TestLabEvidenceController.create);

//Edit one data
router.patch("/:id", [checkJwt], TestLabEvidenceController.edit);

//Delete one data
router.delete("/:id", [checkJwt], TestLabEvidenceController.delete);

export default router;
