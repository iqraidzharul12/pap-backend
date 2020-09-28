import { Router } from "express";
import { DoctorController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], DoctorController.listAll);

// Get one data
router.get("/:id", [checkJwt], DoctorController.getOneById);

//Create a new data
router.post("/", DoctorController.newDoctor);

// //Edit one data
// router.patch(
//   "/:id([0-9]+)",
//   [checkJwt, checkRole(["ADMIN"])],
//   UserController.editUser
// );

// //Delete one data
// router.delete(
//   "/:id([0-9]+)",
//   [checkJwt, checkRole(["ADMIN"])],
//   UserController.deleteUser
// );

export default router;
