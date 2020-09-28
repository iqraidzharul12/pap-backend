import { Router } from "express";
import { DoctorController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], DoctorController.listAll);

// Get one data
router.get("/:id", [checkJwt], DoctorController.getOneById);

//Create a new data
router.post("/", [checkJwt], DoctorController.newDoctor);

// //Edit one data
// router.patch(
//   "/:id([0-9]+)",
//   [checkJwt, checkRole(["ADMIN"])],
//   UserController.editUser
// );

//Delete one data
router.delete("/:id", [checkJwt], DoctorController.delete);

export default router;
