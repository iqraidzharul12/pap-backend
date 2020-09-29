import { Router } from "express";
import { TestLabController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], TestLabController.listAll);

// Get one data
router.get("/:id", [checkJwt], TestLabController.getOneById);

//Create a new data
router.post("/", TestLabController.create);

//Edit one data
router.patch("/:id", [checkJwt], TestLabController.edit);

//Delete one data
router.delete("/:id", [checkJwt], TestLabController.delete);

export default router;
