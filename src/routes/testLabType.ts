import { Router } from "express";
import { TestLabTypeController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", TestLabTypeController.listAll);

// Get one data
router.get("/:id", TestLabTypeController.getOneById);

//Create a new data
router.post("/", TestLabTypeController.create);

//Edit one data
router.patch("/:id", TestLabTypeController.edit);

//Delete one data
router.delete("/:id", TestLabTypeController.delete);

export default router;
