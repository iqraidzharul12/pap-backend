import { Router } from "express";
import { NewsController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", NewsController.listAll);

// Get one data
router.get("/:id", NewsController.getOneById);

//Create a new data
router.post("/", NewsController.create);

//Edit one data
router.patch("/:id", NewsController.edit);

//Delete one data
router.delete("/:id", NewsController.delete);

export default router;
