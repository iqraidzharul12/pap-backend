import { Router } from "express";
import { PatientController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], PatientController.listAll);

// Get one data
router.get("/:id", [checkJwt], PatientController.getOneById);

//Create a new data
router.post("/", PatientController.newPatient);

// //Edit one data
// router.patch(
//   "/:id([0-9]+)",
//   [checkJwt, checkRole(["ADMIN"])],
//   UserController.editUser
// );

//Delete one data
router.delete("/:id", [checkJwt], PatientController.delete);

export default router;
