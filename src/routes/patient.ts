import { Router } from "express";
import { PatientController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", PatientController.listAll);

// Get one data
router.get("/:id", PatientController.getOneById);
router.get("/code/:id", PatientController.getOneByCode);

//Create a new data
router.post("/", PatientController.create);

//Edit one data
router.patch("/:id", PatientController.edit);
router.patch("/clientToken/:id", PatientController.updateClientToken);


//Delete one data
router.delete("/:id", PatientController.delete);

export default router;
