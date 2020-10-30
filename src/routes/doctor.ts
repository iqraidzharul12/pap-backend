import { Router } from "express";
import { DoctorController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", DoctorController.listAll);

// Get one data
router.get("/:id", DoctorController.getOneById);

//Create a new data
router.post("/", DoctorController.create);
router.post("/approve", DoctorController.approve);
router.post("/reject", DoctorController.reject);

//Edit one data
router.patch("/:id", DoctorController.edit);

//Delete one data
router.delete("/:id", DoctorController.delete);

export default router;
