import { Router } from "express";
import { TestLabEvidenceController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", TestLabEvidenceController.listAll);

// Get one data
router.get("/:id", TestLabEvidenceController.getOneById);

//Create a new data
router.post("/", TestLabEvidenceController.create);

//Edit one data
router.patch("/:id", TestLabEvidenceController.edit);

//Delete one data
router.delete("/:id", TestLabEvidenceController.delete);

export default router;
