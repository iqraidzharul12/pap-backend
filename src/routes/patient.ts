import { Router } from "express";
import { PatientController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], PatientController.listAll);

// Get one data
router.get("/:id", [checkJwt], PatientController.getOneById);

//Create a new data
router.post("/", PatientController.create);

//Edit one data
router.patch("/:id", [checkJwt], PatientController.edit);

//Delete one data
router.delete("/:id", [checkJwt], PatientController.delete);

export default router;
