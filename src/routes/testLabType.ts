import { Router } from "express";
import { TestLabTypeController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", [checkJwt], TestLabTypeController.listAll);

// Get one data
router.get("/:id", [checkJwt], TestLabTypeController.getOneById);

//Create a new data
router.post("/", TestLabTypeController.create);

//Edit one data
router.patch("/:id", [checkJwt], TestLabTypeController.edit);

//Delete one data
router.delete("/:id", [checkJwt], TestLabTypeController.delete);

export default router;
