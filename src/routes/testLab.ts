import { Router } from "express";
import { TestLabController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", TestLabController.listAll);

// Get one data
router.get("/:id", TestLabController.getOneById);

//Create a new data
router.post("/", TestLabController.create);
router.post("/self-test", TestLabController.createSelfTest);

//Edit one data
router.patch("/:id", TestLabController.edit);

//Delete one data
router.delete("/:id", TestLabController.delete);

export default router;
