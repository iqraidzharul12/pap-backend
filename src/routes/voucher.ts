import { Router } from "express";
import { VoucherController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], VoucherController.listAll);

// Get one data
router.get("/:id", [checkJwt], VoucherController.getOneById);

//Create a new data
router.post("/", VoucherController.create);

//Edit one data
router.patch("/:id", [checkJwt], VoucherController.edit);

//Delete one data
router.delete("/:id", [checkJwt], VoucherController.delete);

export default router;
