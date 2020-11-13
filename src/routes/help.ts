import { Router } from "express";
import { HelpController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", HelpController.listAll);

// Get one data
router.get("/:id", HelpController.getOneById);

//Create a new data
router.post("/", HelpController.create);

//Edit one data
router.patch("/:id", HelpController.edit);

//Delete one data
router.delete("/:id", HelpController.delete);

export default router;
