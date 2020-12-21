import { Router } from "express";
import { VoucherController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", VoucherController.listAll);

// Get one data
router.get("/:id", VoucherController.getOneById);

//Create a new data
// router.post("/", VoucherController.create);
router.post("/", VoucherController.createBulk);

//Edit one data
router.patch("/:id", VoucherController.edit);

//Delete one data
router.delete("/:id", VoucherController.delete);

export default router;
